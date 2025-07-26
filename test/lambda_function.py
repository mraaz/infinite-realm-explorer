import os
import json
import boto3
import jwt
from datetime import datetime, timezone
import decimal

# --- Configuration ---
DYNAMODB_TABLE_NAME = os.environ.get('ANSWERS_TABLE_NAME', 'infinitelife-answers')
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'a-very-secret-key')
SCORING_THRESHOLD = float(os.environ.get('SCORING_THRESHOLD', 0.80))

# --- AWS Service Clients ---
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(DYNAMODB_TABLE_NAME)

# --- Questions & Scoring Data ---
try:
    with open('questions.json', 'r') as f:
        QUESTIONS_CONFIG = json.load(f)
except FileNotFoundError:
    QUESTIONS_CONFIG = {"questions": {}, "sections": {}, "question_flow": [], "section_flow": []}

# --- Helper Class for JSON serialization ---
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return float(o) if o % 1 > 0 else int(o)
        return super(DecimalEncoder, self).default(o)

# --- Helper Functions ---
def get_user_from_jwt(event):
    headers = event.get('headers') or {}
    auth_header = None
    for key, value in headers.items():
        if key.lower() == 'authorization':
            auth_header = value
            break
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    try:
        token = auth_header.split(' ')[1]
        return jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
    except Exception:
        return None

def calculate_score(question, answer):
    q_type = question.get('type')
    scoring = question.get('scoring', {})
    if not q_type: return 0
    if q_type == 'slider' and 'points' in scoring:
        try:
            return (int(answer) / 10) * scoring['points']
        except (ValueError, TypeError):
            return 0
    elif q_type == 'yes-no' and 'target_answer' in scoring:
        return scoring.get('points', 0) if str(answer).lower() == scoring['target_answer'].lower() else 0
    elif q_type == 'multiple-choice':
        return scoring.get(str(answer), 0)
    return 0

def get_next_question_id(current_question_id, flow):
    try:
        current_index = flow.index(current_question_id)
        return flow[current_index + 1] if current_index + 1 < len(flow) else None
    except (ValueError, IndexError):
        return None

def get_previous_question_id(current_question_id):
    try:
        flow = QUESTIONS_CONFIG.get('question_flow', [])
        current_index = flow.index(current_question_id)
        return flow[current_index - 1] if current_index > 0 else None
    except (ValueError, IndexError):
        return None

def calculate_pillar_progress(section_scores, questions_config):
    pillars = {"career": {"earned": 0, "possible": 0}, "finances": {"earned": 0, "possible": 0}, "health": {"earned": 0, "possible": 0}, "connections": {"earned": 0, "possible": 0}}
    
    for section_id, section_data in questions_config.get('sections', {}).items():
        pillar_key = section_id.split('_')[0]
        if pillar_key == 'financials':
            pillar_key = 'finances'
            
        if pillar_key in pillars:
            pillars[pillar_key]['possible'] += section_data.get('total_points', 0)
            pillars[pillar_key]['earned'] += section_scores.get(section_id, 0)

    pillar_percentages = {}
    for pillar_key, scores in pillars.items():
        percentage = (scores['earned'] / scores['possible']) * 100 if scores['possible'] > 0 else 0
        pillar_percentages[pillar_key] = min(round(percentage, 2), 100)
        
    return pillar_percentages

# --- Main Logic Handlers ---
def handle_answer(event_body, user):
    new_answer_data = event_body.get('newAnswer', {})
    question_id = new_answer_data.get('questionId')
    all_answers = event_body.get('allAnswers', {})

    if not question_id or not all_answers:
        return {'statusCode': 400, 'body': json.dumps({'error': 'Payload must include newAnswer and allAnswers'})}

    # 1. Calculate the true scores based on all answers provided so far.
    actual_section_scores = {}
    for q_id, ans in all_answers.items():
        q_data = QUESTIONS_CONFIG['questions'].get(q_id)
        if q_data:
            score = calculate_score(q_data, ans)
            section_id = q_data.get('section', 'unknown')
            actual_section_scores[section_id] = actual_section_scores.get(section_id, 0) + score

    # 2. Determine the default next question ID.
    question_flow = QUESTIONS_CONFIG.get('question_flow', [])
    next_question_id = get_next_question_id(question_id, question_flow)

    # 3. Check for adaptive skipping logic.
    visual_section_scores = actual_section_scores.copy()
    last_question_data = QUESTIONS_CONFIG['questions'].get(question_id)
    if last_question_data:
        last_section_id = last_question_data.get('section')
        last_section_config = QUESTIONS_CONFIG['sections'].get(last_section_id)
        
        if last_section_config and question_id in last_section_config.get('adaptive_trigger_questions', []):
            current_section_score = actual_section_scores.get(last_section_id, 0)
            max_score_so_far = last_section_config.get('adaptive_max_score', 1)
            
            if max_score_so_far > 0 and (current_section_score / max_score_so_far) >= SCORING_THRESHOLD:
                visual_section_scores[last_section_id] = last_section_config.get('total_points', 0)
                
                last_question_in_section = last_section_config['questions'][-1]
                next_question_id = get_next_question_id(last_question_in_section, question_flow)

    # 4. Save state to the database if a user is logged in.
    if user:
        db_state = {
            'userId': user['sub'],
            'answers': all_answers,
            'section_scores': actual_section_scores,
            'lastQuestionId': next_question_id if next_question_id else 'completed',
            'updatedAt': datetime.now(timezone.utc).isoformat()
        }
        try:
            db_state_to_save = json.loads(json.dumps(db_state, cls=DecimalEncoder), parse_float=decimal.Decimal)
            table.put_item(Item=db_state_to_save)
        except Exception as e:
            print(f"ERROR saving state for user {user['sub']}: {e}")
    
    # 5. Prepare the response.
    progress_for_rings = calculate_pillar_progress(visual_section_scores, QUESTIONS_CONFIG)
    
    # --- NEW LOGIC TO SET PILLAR TO 100% ON COMPLETION ---
    if next_question_id:
        current_question_data = QUESTIONS_CONFIG['questions'].get(question_id)
        next_question_data = QUESTIONS_CONFIG['questions'].get(next_question_id)

        if current_question_data and next_question_data:
            current_section_id = current_question_data.get('section')
            next_section_id = next_question_data.get('section')

            if current_section_id != next_section_id:
                # We've transitioned. The pillar for the *current* section is now complete.
                current_pillar_key = current_section_id.split('_')[0]
                if current_pillar_key == 'financials':
                    current_pillar_key = 'finances'
                
                if current_pillar_key in progress_for_rings:
                    progress_for_rings[current_pillar_key] = 100
    # --- END NEW LOGIC ---

    if next_question_id:
        next_question_data = QUESTIONS_CONFIG['questions'][next_question_id]
        next_question_index = question_flow.index(next_question_id) if next_question_id in question_flow else 0
        total_questions = len(question_flow)
        overall_progress = (next_question_index / total_questions) * 100 if total_questions > 0 else 0
        response_body = {
            'nextQuestion': next_question_data, 
            'pillarProgress': progress_for_rings, 
            'currentQuestionIndex': next_question_index,
            'overallProgress': round(overall_progress)
        }
        return {'statusCode': 200, 'body': json.dumps(response_body)}
    else:
        # On final completion, set all pillars to 100%
        final_progress = {key: 100 for key in progress_for_rings}
        response_body = {
            'status': 'completed', 
            'finalScores': actual_section_scores, 
            'pillarProgress': final_progress,
            'overallProgress': 100
        }
        return {'statusCode': 200, 'body': json.dumps(response_body, cls=DecimalEncoder)}
    
def handle_previous(event_body, user):
    current_question_id = event_body.get('currentQuestionId')
    all_answers = event_body.get('allAnswers', {})

    if not current_question_id or not all_answers:
        return {'statusCode': 400, 'body': json.dumps({'error': 'Payload must include currentQuestionId and allAnswers'})}

    previous_question_id = get_previous_question_id(current_question_id)
    if not previous_question_id:
        return {'statusCode': 400, 'body': json.dumps({'error': 'Cannot go back further'})}

    if current_question_id in all_answers:
        del all_answers[current_question_id]

    section_scores = {}
    for q_id, ans in all_answers.items():
        q_data = QUESTIONS_CONFIG['questions'].get(q_id)
        if q_data:
            score = calculate_score(q_data, ans)
            section_id = q_data.get('section', 'unknown')
            section_scores[section_id] = section_scores.get(section_id, 0) + score
    
    progress = calculate_pillar_progress(section_scores, QUESTIONS_CONFIG)
    previous_question_data = QUESTIONS_CONFIG['questions'].get(previous_question_id)
    question_flow = QUESTIONS_CONFIG.get('question_flow', [])
    previous_question_index = question_flow.index(previous_question_id) if previous_question_id in question_flow else 0

    response_body = {'previousQuestion': previous_question_data, 'pillarProgress': progress, 'updatedAnswers': all_answers, 'currentQuestionIndex': previous_question_index}
    return {'statusCode': 200, 'body': json.dumps(response_body, cls=DecimalEncoder)}

def handle_save_progress(event_body, user):
    if not user:
        return {'statusCode': 401, 'body': json.dumps({'error': 'Authentication required'})}
    answers = event_body.get('answers', {})
    if not answers:
        return {'statusCode': 400, 'body': json.dumps({'error': 'No answers provided to save.'})}
    user_state = {'userId': user['sub'], 'answers': answers, 'section_scores': {}, 'createdAt': datetime.now(timezone.utc).isoformat()}
    for q_id, ans in answers.items():
        question_data = QUESTIONS_CONFIG['questions'].get(q_id)
        if question_data:
            score = calculate_score(question_data, ans)
            section_id = question_data['section']
            user_state['section_scores'][section_id] = user_state['section_scores'].get(section_id, 0) + score
    last_question_answered = list(answers.keys())[-1]
    question_flow = QUESTIONS_CONFIG.get('question_flow', [])
    next_question_id = get_next_question_id(last_question_answered, question_flow)
    user_state['lastQuestionId'] = next_question_id if next_question_id else 'completed'
    user_state['updatedAt'] = datetime.now(timezone.utc).isoformat()
    try:
        user_state_db = json.loads(json.dumps(user_state), parse_float=decimal.Decimal)
        table.put_item(Item=user_state_db)
        print(f"Successfully saved GUEST progress for user {user['sub']}")
        return {'statusCode': 200, 'body': json.dumps({'message': 'Progress saved successfully'})}
    except Exception as e:
        print(f"Error saving guest progress for user {user['sub']}: {e}")
        return {'statusCode': 500, 'body': json.dumps({'error': 'Could not save progress'})}

def handle_get_state(user):
    if not user:
        return {'statusCode': 401, 'body': json.dumps({'error': 'Authentication required'})}
    try:
        response = table.get_item(Key={'userId': user['sub']})
        if 'Item' in response:
            user_state = response['Item']
            progress = calculate_pillar_progress(user_state.get('section_scores', {}), QUESTIONS_CONFIG)
            user_state['pillarProgress'] = progress
            next_question_id = user_state.get('lastQuestionId')
            if next_question_id and next_question_id != 'completed':
                next_question_object = QUESTIONS_CONFIG['questions'].get(next_question_id)
                user_state['nextQuestion'] = next_question_object
            print(f"Successfully fetched state for user {user['sub']}")
            return {'statusCode': 200, 'body': json.dumps(user_state, cls=DecimalEncoder)}
        else:
            print(f"No state found for user {user['sub']}. Sending first question.")
            first_question_id = QUESTIONS_CONFIG['question_flow'][0]
            first_question = QUESTIONS_CONFIG['questions'][first_question_id]
            initial_progress = calculate_pillar_progress({}, QUESTIONS_CONFIG)
            response_body = {'nextQuestion': first_question, 'pillarProgress': initial_progress}
            return {'statusCode': 200, 'body': json.dumps(response_body)}
    except Exception as e:
        print(f"Error getting state for user {user['sub']}: {e}")
        return {'statusCode': 500, 'body': json.dumps({'error': 'Could not retrieve state'})}

# --- Lambda Entry Point ---
def lambda_handler(event, context):
    print("Received event: " + json.dumps(event, indent=2))

    allowed_origins = [
        "http://localhost:8080",
        "https://infinitegame.live",
        "https://infinite-game-live.lovable.app",
        "https://997cdcc2-64fd-4803-ba8b-2c36d9d662b3.lovableproject.com"
    ]
    
    origin = event.get('headers', {}).get('origin') or event.get('headers', {}).get('Origin')
    
    cors_headers = {
        'Access-Control-Allow-Origin': origin if origin in allowed_origins else allowed_origins[0],
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'POST,GET,OPTIONS'
    }
    
    if origin in allowed_origins:
        cors_headers['Access-Control-Allow-Origin'] = origin

    if event.get('httpMethod') == 'OPTIONS':
        print("Handling CORS preflight request")
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': ''
        }

    try:
        path = event.get('path', '')
        http_method = event.get('httpMethod', '')
        user = get_user_from_jwt(event)
        body = json.loads(event.get('body') or '{}')

        if path.endswith('/questionnaire/answer'):
            response = handle_answer(body, user)
        elif path.endswith('/questionnaire/previous'):
            response = handle_previous(body, user)
        elif path.endswith('/questionnaire/save-progress'):
            response = handle_save_progress(body, user)
        elif path.endswith('/questionnaire/state'):
            response = handle_get_state(user)
        else:
            response = {'statusCode': 404, 'body': json.dumps({'error': f'Endpoint not found: {http_method} {path}'})}
        
        if 'headers' not in response:
            response['headers'] = {}
        response['headers'].update(cors_headers)
        return response

    except Exception as e:
        print(f"An unexpected error occurred in the handler: {e}")
        error_response = {
            'statusCode': 500,
            'body': json.dumps({'error': f'Internal server error: {str(e)}'})
        }
        error_response['headers'] = cors_headers
        return error_response
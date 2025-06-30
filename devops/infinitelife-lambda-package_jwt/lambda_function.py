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

def get_next_question_id(current_question_id):
    try:
        flow = QUESTIONS_CONFIG.get('question_flow', [])
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

def calculate_pillar_progress(user_state, questions_config):
    pillars = {"career": {"earned": 0, "possible": 0}, "finances": {"earned": 0, "possible": 0}, "health": {"earned": 0, "possible": 0}, "connections": {"earned": 0, "possible": 0}}
    current_section_scores = user_state.get('section_scores', {})
    for section_id, section_data in questions_config.get('sections', {}).items():
        pillar_key = section_id.split('_')[0]
        if pillar_key == 'financials':
            pillar_key = 'finances'
        if pillar_key in pillars:
            pillars[pillar_key]['possible'] += section_data.get('total_points', 0)
            pillars[pillar_key]['earned'] += current_section_scores.get(section_id, 0)
    pillar_percentages = {}
    for pillar_key, scores in pillars.items():
        percentage = (scores['earned'] / scores['possible']) * 100 if scores['possible'] > 0 else 0
        pillar_percentages[pillar_key] = round(percentage, 2)
    return pillar_percentages

# --- Main Logic Handlers ---
def handle_answer(event_body, user):
    new_answer_data = event_body.get('newAnswer', {})
    question_id = new_answer_data.get('questionId')
    all_answers = event_body.get('allAnswers', {})

    if not question_id or not all_answers:
        return {'statusCode': 400, 'body': json.dumps({'error': 'Payload must include newAnswer and allAnswers'})}

    user_state = {'answers': all_answers, 'section_scores': {}}
    if user:
        try:
            response = table.get_item(Key={'userId': user['sub']})
            if 'Item' in response:
                user_state = response['Item']
                user_state['answers'] = all_answers
        except Exception as e:
            print(f"Error fetching user state: {e}")

    user_state['section_scores'] = {}
    for q_id, ans in all_answers.items():
        q_data = QUESTIONS_CONFIG['questions'].get(q_id)
        if q_data:
            score = calculate_score(q_data, ans)
            section_id = q_data.get('section', 'unknown')
            user_state['section_scores'][section_id] = user_state['section_scores'].get(section_id, 0) + score

    visual_scores = user_state['section_scores'].copy()
    for section_id, section_config in QUESTIONS_CONFIG.get('sections', {}).items():
        trigger_questions = section_config.get('adaptive_trigger_questions', [])
        if any(q in all_answers for q in trigger_questions):
            current_section_score = user_state['section_scores'].get(section_id, 0)
            max_score_so_far = section_config.get('adaptive_max_score', 1)
            if max_score_so_far > 0 and (current_section_score / max_score_so_far) >= SCORING_THRESHOLD:
                visual_scores[section_id] = section_config.get('total_points', current_section_score)

    next_question_id = get_next_question_id(question_id)
    
    last_question_data = QUESTIONS_CONFIG['questions'].get(question_id)
    if last_question_data:
        last_section_id = last_question_data.get('section')
        last_section_config = QUESTIONS_CONFIG['sections'].get(last_section_id)
        if last_section_config and question_id in last_section_config.get('adaptive_trigger_questions', []):
            if visual_scores.get(last_section_id) == last_section_config.get('total_points'):
                section_flow = QUESTIONS_CONFIG.get('section_flow', [])
                try:
                    current_section_index = section_flow.index(last_section_id)
                    if current_section_index + 1 < len(section_flow):
                        next_section_id = section_flow[current_section_index + 1]
                        next_question_id = QUESTIONS_CONFIG['sections'][next_section_id]['questions'][0]
                    else:
                        next_question_id = None
                except (ValueError, IndexError):
                    pass

    if user:
        db_state = {
            'userId': user['sub'],
            'answers': user_state['answers'],
            'section_scores': user_state['section_scores'],
            'lastQuestionId': next_question_id if next_question_id else 'completed',
            'updatedAt': datetime.now(timezone.utc).isoformat()
        }
        try:
            db_state_to_save = json.loads(json.dumps(db_state, cls=DecimalEncoder), parse_float=decimal.Decimal)
            table.put_item(Item=db_state_to_save)
            print(f"Successfully saved state for user {user['sub']}")
        except Exception as e:
            print(f"ERROR saving state for user {user['sub']}: {e}")
    
    progress_for_rings = calculate_pillar_progress({'section_scores': visual_scores}, QUESTIONS_CONFIG)
    
    if next_question_id:
        next_question_data = QUESTIONS_CONFIG['questions'][next_question_id]
        response_body = {'nextQuestion': next_question_data, 'pillarProgress': progress_for_rings}
        return {'statusCode': 200, 'body': json.dumps(response_body)}
    else:
        final_progress = calculate_pillar_progress(user_state, QUESTIONS_CONFIG)
        response_body = {'status': 'completed', 'finalScores': user_state['section_scores'], 'pillarProgress': final_progress}
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

    user_state = {'answers': all_answers, 'section_scores': {}}
    for q_id, ans in all_answers.items():
        q_data = QUESTIONS_CONFIG['questions'].get(q_id)
        if q_data:
            score = calculate_score(q_data, ans)
            section_id = q_data.get('section', 'unknown')
            user_state['section_scores'][section_id] = user_state['section_scores'].get(section_id, 0) + score
    
    progress = calculate_pillar_progress(user_state, QUESTIONS_CONFIG)
    previous_question_data = QUESTIONS_CONFIG['questions'].get(previous_question_id)

    response_body = {'previousQuestion': previous_question_data, 'pillarProgress': progress, 'updatedAnswers': all_answers}
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
    next_question_id = get_next_question_id(last_question_answered)
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
            progress = calculate_pillar_progress(user_state, QUESTIONS_CONFIG)
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

# --- Lambda Entry Point (With Dynamic CORS) ---
def lambda_handler(event, context):
    print("Received event: " + json.dumps(event, indent=2))

    # --- THIS IS THE FIX ---
    # Define your allowed origins, including your new domains.
    allowed_origins = [
        "http://localhost:8080",
        "https://infinitegame.live",
        "https://infinite-game-live.lovable.app"
    ]
    
    origin = event.get('headers', {}).get('origin')
    
    # Default CORS headers
    cors_headers = {
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
    }
    
    # If the origin is in our whitelist, add it to the response header
    if origin in allowed_origins:
        cors_headers['Access-Control-Allow-Origin'] = origin

    # Handle preflight OPTIONS request
    if event.get('httpMethod') == 'OPTIONS':
        print("Handling CORS preflight request")
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': ''
        }

    # Process the actual request
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
        
        # Add CORS headers to every response
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

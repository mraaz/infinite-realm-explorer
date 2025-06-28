import os
import json
import boto3
import jwt
from datetime import datetime, timezone

# --- Configuration ---
DYNAMODB_TABLE_NAME = os.environ.get('ANSWERS_TABLE_NAME', 'infinitelife-answers')
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'a-very-secret-key')
SCORING_THRESHOLD = float(os.environ.get('SCORING_THRESHOLD', 0.80))

# --- AWS Service Clients ---
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(DYNAMODB_TABLE_NAME)

# --- CORS Headers ---
# These are still useful to ensure our actual GET/POST responses include the correct headers.
CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
}

# --- Questions & Scoring Data ---
try:
    with open('questions.json', 'r') as f:
        QUESTIONS_CONFIG = json.load(f)
except FileNotFoundError:
    QUESTIONS_CONFIG = {"questions": {}, "sections": {}, "question_flow": [], "section_flow": []}

# --- Helper Functions (No changes needed) ---
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

def calculate_pillar_progress(user_state, questions_config):
    pillars = {"career": {"earned": 0, "possible": 0}, "finances": {"earned": 0, "possible": 0}, "health": {"earned": 0, "possible": 0}, "connections": {"earned": 0, "possible": 0}}
    current_section_scores = user_state.get('section_scores', {})
    for section_id, section_data in questions_config.get('sections', {}).items():
        pillar_key = section_id.split('_')[0]
        if pillar_key in pillars:
            pillars[pillar_key]['possible'] += section_data.get('total_points', 0)
            pillars[pillar_key]['earned'] += current_section_scores.get(section_id, 0)
    pillar_percentages = {}
    for pillar_key, scores in pillars.items():
        percentage = (scores['earned'] / scores['possible']) * 100 if scores['possible'] > 0 else 0
        pillar_percentages[pillar_key] = round(percentage, 2)
    return pillar_percentages

# --- Main Logic Handlers (No changes needed) ---
def handle_answer(event_body, user):
    new_answer_data = event_body.get('newAnswer', {})
    question_id = new_answer_data.get('questionId')
    all_answers = event_body.get('allAnswers', {})

    if not question_id or not all_answers:
        return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Payload must include newAnswer and allAnswers'})}

    question_data = QUESTIONS_CONFIG['questions'].get(question_id)
    if not question_data:
        return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Question not found'})}

    user_state = {'answers': all_answers, 'section_scores': {}}
    
    for q_id, ans in all_answers.items():
        q_data = QUESTIONS_CONFIG['questions'].get(q_id)
        if q_data:
            score = calculate_score(q_data, ans)
            section_id = q_data.get('section', 'unknown')
            user_state['section_scores'][section_id] = user_state['section_scores'].get(section_id, 0) + score

    for section_id, section_config in QUESTIONS_CONFIG.get('sections', {}).items():
        trigger_questions = section_config.get('adaptive_trigger_questions', [])
        if any(q in all_answers for q in trigger_questions):
            current_section_score = user_state['section_scores'].get(section_id, 0)
            max_score_so_far = section_config.get('adaptive_max_score', 1)
            if (current_section_score / max_score_so_far) >= SCORING_THRESHOLD:
                user_state['section_scores'][section_id] = section_config.get('total_points', current_section_score)

    next_question_id = get_next_question_id(question_id)
    
    last_question_data = QUESTIONS_CONFIG['questions'].get(question_id)
    if last_question_data:
        last_section_id = last_question_data.get('section')
        last_section_config = QUESTIONS_CONFIG['sections'].get(last_section_id)
        if last_section_config and question_id in last_section_config.get('adaptive_trigger_questions', []):
            last_section_score = user_state['section_scores'].get(last_section_id, 0)
            if last_section_score == last_section_config.get('total_points'):
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
        db_state = {'userId': user['sub']}
        db_state.update(user_state)
        db_state['lastQuestionId'] = next_question_id if next_question_id else 'completed'
        db_state['updatedAt'] = datetime.now(timezone.utc).isoformat()
        table.put_item(Item=db_state)
    
    progress = calculate_pillar_progress(user_state, QUESTIONS_CONFIG)
    
    if next_question_id:
        next_question_data = QUESTIONS_CONFIG['questions'][next_question_id]
        response_body = {'nextQuestion': next_question_data, 'pillarProgress': progress}
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps(response_body)}
    else:
        response_body = {'status': 'completed', 'finalScores': user_state['section_scores'], 'pillarProgress': progress}
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps(response_body)}

def handle_save_progress(event_body, user):
    # This function is correct as is
    pass

def handle_get_state(user):
    # This function is correct as is
    pass

# --- Lambda Entry Point (Corrected for API Gateway) ---
def lambda_handler(event, context):
    print("Received event: " + json.dumps(event, indent=2))

    # Get the path and method from the API Gateway event
    path = event.get('path', '')
    http_method = event.get('httpMethod', '')
    user = get_user_from_jwt(event)
    
    body = {}
    if event.get('body'):
        try:
            body = json.loads(event['body'])
        except json.JSONDecodeError:
            return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Invalid JSON body'})}

    try:
        # --- THIS IS THE FIX ---
        # This is the corrected routing logic for API Gateway.
        # It uses the URL path to decide which function to call.
        if path == '/questionnaire/answer' and http_method == 'POST':
            return handle_answer(body, user)
        elif path == '/questionnaire/save-progress' and http_method == 'POST':
            return handle_save_progress(body, user)
        elif path == '/questionnaire/state' and http_method == 'GET':
            return handle_get_state(user)
        else:
            # If the path doesn't match, return a 404
            return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': f'Endpoint not found: {http_method} {path}'})}
    except Exception as e:
        print(f"An unexpected error occurred in the handler: {e}")
        return {'statusCode': 500, 'headers': CORS_HEADERS, 'body': json.dumps({'error': f'Internal server error: {str(e)}'})}

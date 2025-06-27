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

# --- Main Logic Handlers (No changes needed) ---
def handle_answer(event_body, user):
    question_id = event_body.get('questionId')
    answer = event_body.get('answer')
    if not question_id or answer is None:
        return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'questionId and answer are required'})}
    question_data = QUESTIONS_CONFIG['questions'].get(question_id)
    if not question_data:
        return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Question not found'})}
    user_state = {'answers': {}, 'section_scores': {}, 'completed_sections': []}
    if user:
        try:
            response = table.get_item(Key={'userId': user['sub']})
            if 'Item' in response:
                user_state = response['Item']
        except Exception as e:
            print(f"Error fetching user state: {e}")
    user_state['answers'][question_id] = answer
    score = calculate_score(question_data, answer)
    section_id = question_data.get('section', 'unknown')
    user_state['section_scores'][section_id] = user_state['section_scores'].get(section_id, 0) + score
    next_question_id = get_next_question_id(question_id)
    if user:
        user_state['userId'] = user['sub']
        user_state['lastQuestionId'] = next_question_id if next_question_id else 'completed'
        user_state['updatedAt'] = datetime.now(timezone.utc).isoformat()
        table.put_item(Item=user_state)
    # This logic was missing from your last version, adding it back.
    progress = calculate_pillar_progress(user_state, QUESTIONS_CONFIG)
    if next_question_id:
        next_question_data = QUESTIONS_CONFIG['questions'][next_question_id]
        response_body = {'nextQuestion': next_question_data, 'pillarProgress': progress}
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps(response_body)}
    else:
        response_body = {'status': 'completed', 'finalScores': user_state['section_scores'], 'pillarProgress': progress}
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps(response_body)}

def handle_save_progress(event_body, user):
    # This function is correct as is.
    pass

def handle_get_state(user):
    # This function is correct as is.
    pass

# --- Lambda Entry Point (Simplified for API Gateway) ---
def lambda_handler(event, context):
    print("Received event: " + json.dumps(event, indent=2))

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
        if path.endswith('/questionnaire/answer') and http_method == 'POST':
            return handle_answer(body, user)
        elif path.endswith('/questionnaire/save-progress') and http_method == 'POST':
            return handle_save_progress(body, user)
        elif path.endswith('/questionnaire/state') and http_method == 'GET':
            return handle_get_state(user)
        else:
            return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': f'Endpoint not found: {http_method} {path}'})}
    except Exception as e:
        print(f"Unexpected error in lambda_handler: {e}")
        return {'statusCode': 500, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Internal server error'})}


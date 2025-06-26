import json
import os
import jwt
from datetime import datetime, timezone
import boto3

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

# --- CORS Headers ---
# Central place for all CORS headers to ensure consistency.
CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'POST,OPTIONS'
}

# --- Helper Functions ---
def get_user_from_jwt(event):
    headers = event.get('headers') or {}
    auth_header = headers.get('Authorization') or headers.get('authorization')
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
    pillars = {"career": {"earned": 0, "possible": 0}, "financials": {"earned": 0, "possible": 0}, "health": {"earned": 0, "possible": 0}, "connections": {"earned": 0, "possible": 0}}
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

# --- Main Logic Handlers ---
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
        
    progress = calculate_pillar_progress(user_state, QUESTIONS_CONFIG)
    
    if next_question_id:
        next_question_data = QUESTIONS_CONFIG['questions'][next_question_id]
        response_body = {'nextQuestion': next_question_data, 'pillarProgress': progress}
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps(response_body)}
    else:
        response_body = {'status': 'completed', 'finalScores': user_state['section_scores'], 'pillarProgress': progress}
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps(response_body)}

def handle_save_progress(event_body, user):
    answers = event_body.get('answers', {})
    user_state = {'userId': user['sub'], 'answers': answers, 'section_scores': {}, 'completed_sections': [], 'createdAt': datetime.now(timezone.utc).isoformat()}
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
    progress = calculate_pillar_progress(user_state, QUESTIONS_CONFIG)
    user_state['pillarProgress'] = progress
    table.put_item(Item=user_state)
    return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps(user_state)}

def handle_get_state(user):
    try:
        response = table.get_item(Key={'userId': user['sub']})
        if 'Item' in response:
            user_state = response['Item']
            progress = calculate_pillar_progress(user_state, QUESTIONS_CONFIG)
            user_state['pillarProgress'] = progress
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps(user_state)}
        else:
            first_question_id = QUESTIONS_CONFIG['question_flow'][0]
            first_question = QUESTIONS_CONFIG['questions'][first_question_id]
            initial_progress = calculate_pillar_progress({}, QUESTIONS_CONFIG)
            response_body = {'nextQuestion': first_question, 'pillarProgress': initial_progress}
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps(response_body)}
    except Exception as e:
        print(f"Error getting state: {e}")
        return {'statusCode': 500, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Could not retrieve state'})}


# --- Lambda Entry Point ---
def lambda_handler(event, context):
    print("Received event: " + json.dumps(event, indent=2))
    
    http_method = event.get('requestContext', {}).get('http', {}).get('method')
    
    # Handle the browser's preflight OPTIONS request first.
    if http_method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': ''
        }

    # If not OPTIONS, proceed with processing the POST request.
    try:
        body = json.loads(event.get('body', '{}')) if isinstance(event.get('body'), str) else event.get('body', {})
    except (json.JSONDecodeError, TypeError):
        return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Invalid JSON in request body'})}

    action = body.get('action')
    payload = body.get('payload', {})
    user = get_user_from_jwt(event)

    # All handlers need a user object, except for anonymous answer submissions
    if action in ['saveProgress', 'getState'] and not user:
         return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Authentication required'})}

    if action == 'submitAnswer':
        return handle_answer(payload, user)
    elif action == 'saveProgress':
        return handle_save_progress(payload, user)
    elif action == 'getState':
        return handle_get_state(user)
    else:
        return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': f"Action '{action}' not recognized."})}

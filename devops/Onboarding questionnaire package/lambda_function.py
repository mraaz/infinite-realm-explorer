# lambda_function.py
# Main handler for the Infinite Life adaptive questionnaire.

import os
import json
import boto3
import jwt
from datetime import datetime, timezone

# --- Configuration ---
# These will be set as environment variables in the Lambda configuration.
DYNAMODB_TABLE_NAME = os.environ.get('ANSWERS_TABLE_NAME', 'infinitelife-answers')
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'a-very-secret-key')
SCORING_THRESHOLD = float(os.environ.get('SCORING_THRESHOLD', 0.80))

# --- AWS Service Clients ---
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(DYNAMODB_TABLE_NAME)

# --- Questions & Scoring Data ---
# This dictionary contains all the questionnaire logic.
# It's loaded from a separate questions.json file included in the deployment package.
with open('questions.json', 'r') as f:
    QUESTIONS_CONFIG = json.load(f)

# --- Helper Functions ---

def get_user_from_jwt(event):
    """Decodes the JWT from the request headers to get the user ID."""
    try:
        # The 'Authorization' header is what we'll use, but some testing tools use 'authorization'.
        auth_header = event.get('headers', {}).get('Authorization') or event.get('headers', {}).get('authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        token = auth_header.split(' ')[1]
        decoded = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
        return decoded
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, IndexError, KeyError):
        return None

def calculate_score(question, answer):
    """Calculates the score for a given answer based on the question type."""
    q_type = question['type']
    scoring = question['scoring']
    
    if q_type == 'slider':
        return (int(answer) / 10) * scoring['points']
    
    elif q_type == 'yes-no':
        return scoring['points'] if str(answer).lower() == scoring['target_answer'].lower() else 0

    elif q_type == 'multiple-choice':
        # The score is the value mapped to the chosen option key
        return scoring.get(str(answer), 0)
        
    return 0

def get_next_question_id(current_question_id):
    """Finds the ID of the next question in the predefined flow."""
    try:
        flow = QUESTIONS_CONFIG['question_flow']
        current_index = flow.index(current_question_id)
        if current_index + 1 < len(flow):
            return flow[current_index + 1]
        else:
            return None # End of questionnaire
    except (ValueError, IndexError):
        return None

# --- Main Logic Handler ---

def handle_answer(event_body, user):
    """Processes a single answer submission."""
    question_id = event_body['questionId']
    answer = event_body['answer']

    question_data = QUESTIONS_CONFIG['questions'].get(question_id)
    if not question_data:
        return {'statusCode': 404, 'body': json.dumps({'error': 'Question not found'})}

    # --- State Initialization ---
    user_state = {
        'answers': {},
        'section_scores': {},
        'completed_sections': []
    }
    
    if user:
        try:
            response = table.get_item(Key={'userId': user['sub']})
            if 'Item' in response:
                user_state = response['Item']
        except Exception as e:
            print(f"Error fetching user state: {e}")

    # --- Process the new answer ---
    user_state['answers'][question_id] = answer
    score = calculate_score(question_data, answer)
    
    section_id = question_data['section']
    section_config = QUESTIONS_CONFIG['sections'][section_id]
    
    user_state['section_scores'][section_id] = user_state['section_scores'].get(section_id, 0) + score
    
    # --- Adaptive Scoring Logic ---
    next_question_id = get_next_question_id(question_id)
    
    if question_id in section_config.get('adaptive_trigger_questions', []):
        current_section_score = user_state['section_scores'][section_id]
        max_score_so_far = section_config['adaptive_max_score']
        
        if (current_section_score / max_score_so_far) >= SCORING_THRESHOLD:
            print(f"User scored high in section {section_id}. Skipping to next section.")
            user_state['completed_sections'].append(section_id)
            
            final_percentage = current_section_score / max_score_so_far
            user_state['section_scores'][section_id] = final_percentage * section_config['total_points']

            current_section_index = QUESTIONS_CONFIG['section_flow'].index(section_id)
            next_question_id = None
            for i in range(current_section_index + 1, len(QUESTIONS_CONFIG['section_flow'])):
                next_sec_id = QUESTIONS_CONFIG['section_flow'][i]
                next_question_id = QUESTIONS_CONFIG['sections'][next_sec_id]['questions'][0]
                break
    
    # --- Save State for Logged-in Users ---
    if user:
        user_state['userId'] = user['sub']
        user_state['lastQuestionId'] = next_question_id if next_question_id else 'completed'
        user_state['updatedAt'] = datetime.now(timezone.utc).isoformat()
        try:
            table.put_item(Item=user_state)
        except Exception as e:
            print(f"Error saving user state: {e}")

    # --- Prepare and Return Response ---
    if next_question_id:
        next_question_data = QUESTIONS_CONFIG['questions'][next_question_id]
        return {'statusCode': 200, 'body': json.dumps({'nextQuestion': next_question_data})}
    else:
        return {'statusCode': 200, 'body': json.dumps({'status': 'completed', 'finalScores': user_state['section_scores']})}

def handle_save_progress(event_body, user):
    """Saves a guest's entire progress after they log in."""
    if not user:
        return {'statusCode': 401, 'body': json.dumps({'error': 'Authentication required'})}

    answers = event_body.get('answers', {})
    user_state = {
        'userId': user['sub'],
        'answers': answers,
        'section_scores': {},
        'completed_sections': [],
        'createdAt': datetime.now(timezone.utc).isoformat()
    }

    # Recalculate all scores based on the provided answers
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
        table.put_item(Item=user_state)
        return {'statusCode': 200, 'body': json.dumps({'message': 'Progress saved successfully'})}
    except Exception as e:
        print(f"Error saving progress: {e}")
        return {'statusCode': 500, 'body': json.dumps({'error': 'Could not save progress'})}

def handle_get_state(user):
    """Fetches the current state for a logged-in user."""
    if not user:
        return {'statusCode': 401, 'body': json.dumps({'error': 'Authentication required'})}

    try:
        response = table.get_item(Key={'userId': user['sub']})
        if 'Item' in response:
            return {'statusCode': 200, 'body': json.dumps(response['Item'])}
        else:
            first_question_id = QUESTIONS_CONFIG['question_flow'][0]
            first_question = QUESTIONS_CONFIG['questions'][first_question_id]
            return {'statusCode': 200, 'body': json.dumps({'nextQuestion': first_question})}
    except Exception as e:
        print(f"Error getting state: {e}")
        return {'statusCode': 500, 'body': json.dumps({'error': 'Could not retrieve state'})}


# --- Lambda Entry Point ---
def lambda_handler(event, context):
    path = event.get('path')
    user = get_user_from_jwt(event)
    
    try:
        body = json.loads(event.get('body', '{}'))
    except json.JSONDecodeError:
        return {'statusCode': 400, 'body': json.dumps({'error': 'Invalid JSON body'})}

    if path == '/questionnaire/answer':
        return handle_answer(body, user)
    
    elif path == '/questionnaire/save-progress':
        return handle_save_progress(body, user)
        
    elif path == '/questionnaire/state':
        return handle_get_state(user)
        
    else:
        return {'statusCode': 404, 'body': json.dumps({'error': 'Endpoint not found'})}
import json
import os
import boto3
import jwt
import sys
from botocore.exceptions import ClientError
from decimal import Decimal

# --- Helper Class for JSON serialization ---
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal):
            return int(o) if o % 1 == 0 else float(o)
        return super(DecimalEncoder, self).default(o)

# --- Configuration ---
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-default-secret-key')
BEDROCK_MODEL_ID = os.environ.get('BEDROCK_MODEL_ID', 'anthropic.claude-3-sonnet-20240229-v1:0')
ANSWERS_TABLE_NAME = os.environ.get('ANSWERS_TABLE_NAME', 'infinitelife-answers')
USERS_TABLE_NAME = os.environ.get('USERS_TABLE_NAME', 'infinitelife-users')
ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "https://infinitegame.live",
    "https://infinite-game-live.lovable.app",
    "https://997cdcc2-64fd-4803-ba8b-2c36d9d662b3.lovableproject.com"
]

# --- AWS Service Clients ---
bedrock_runtime = boto3.client('bedrock-runtime')
dynamodb = boto3.resource('dynamodb')
answers_table = dynamodb.Table(ANSWERS_TABLE_NAME)
users_table = dynamodb.Table(USERS_TABLE_NAME)

# --- Load Questions Data ---
try:
    with open('questions.json', 'r') as f:
        QUESTIONS_CONFIG = json.load(f)
except FileNotFoundError:
    print("ERROR: questions.json not found.")
    QUESTIONS_CONFIG = {"questions": {}}

# --- Helper Functions ---
def get_cors_headers(event):
    headers = event.get('headers') or {}
    origin = headers.get('origin') or headers.get('Origin')
    if origin in ALLOWED_ORIGINS:
        return {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'POST,GET,OPTIONS'
        }
    return {}

def get_user_id_from_token(event):
    headers = event.get('headers') or {}
    auth_header = None
    for key, value in headers.items():
        if key.lower() == 'authorization': 
            auth_header = value
            break
    if not auth_header or not auth_header.startswith('Bearer '):
        if event.get('requestContext', {}).get('stage') == 'test-invoke-stage': 
            return "test-user-id"
        raise ValueError('Missing or invalid Authorization header')
    token = auth_header.split(' ')[1]
    decoded_token = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
    user_id = decoded_token.get('sub')
    if not user_id: 
        raise ValueError('Invalid token: missing "sub" claim')
    return user_id

def save_summary_to_db(user_id, summary_data):
    try:
        print(f"Attempting to save summary for userId: {user_id} to {ANSWERS_TABLE_NAME}")
        sys.stdout.flush()
        answers_table.update_item(
            Key={'userId': user_id},
            UpdateExpression="SET selfDiscoverySummary = :s",
            ExpressionAttributeValues={':s': summary_data}
        )
        print(f"Successfully saved summary for userId: {user_id}")
        sys.stdout.flush()
        return True
    except ClientError as e:
        print(f"Error saving summary to DynamoDB: {e.response['Error']['Message']}")
        sys.stdout.flush()
        return False

def update_user_completion_status(user_id):
    try:
        print(f"Attempting to update completion status for userId: {user_id} in {USERS_TABLE_NAME}")
        sys.stdout.flush()
        users_table.update_item(
            Key={'userId': user_id},
            UpdateExpression="SET completedFutureQuestionnaire = :val",
            ExpressionAttributeValues={':val': True}
        )
        print(f"Successfully updated completion status for userId: {user_id}")
        sys.stdout.flush()
        return True
    except ClientError as e:
        print(f"Error updating user completion status: {e.response['Error']['Message']}")
        sys.stdout.flush()
        return False

def generate_summary_from_answers(answers_payload):
    conversation_list = []
    questions_map = QUESTIONS_CONFIG.get("questions", {})
    for question_id, answer in answers_payload.items():
        question_text = questions_map.get(question_id, {}).get("question", question_id)
        conversation_list.append(f"Q: {question_text}\nA: {answer}")
    conversation_text = "\n\n".join(conversation_list)
    
    # --- NEW, MORE INTELLIGENT PROMPT ---
    prompt = f"""
You are a highly perceptive and empathetic AI life coach, specialising in coaching users early in their career. 

The user has completed a detailed self-reflection questionnaire. Your task is to analyse their answers with deep insight and generate a personalised "Self-Discovery Summary".

**Core Analytical Framework:**
Your primary goal is to identify the **tensions and contradictions** between the user's actions and their stated feelings. This is where the most valuable insights are found for this age group. Do not simply repeat their answers; synthesise them to uncover the 'why' behind the 'what'.

**Key Principles for Analysis:**
1.  **Identify Contradictions:** Look for areas where the user is doing all the "right" things but doesn't feel the expected positive emotion. For example, they exercise consistently but find it a "chore," or they are financially secure but feel no "pride" in their work. These gaps are the most important areas to focus on.
2.  **Infer Deeper Motivations:** What is the underlying drive behind their habits? For example, strong saving habits might point to a deep-seated need for security and control. A reluctance to set boundaries might indicate a fear of conflict.
3.  **Maintain Age-Relevance:** All advice must be tailored for a young professional (1-2 years into their career). Focus on building foundational habits, exploring identity, and developing emotional resilience, not on advanced, late-career goals.
4.  **Be Realistic and Practical:** Actionable steps must be small, achievable within 3-6 months, and designed to build momentum. Avoid vague advice.

Use Australian English spelling and a positive, encouraging tone that avoids jargon or clichés.

**Respond ONLY in the following JSON format (no commentary or explanation as this is for React app):**

{{
  "title": "Your Self-Discovery Summary",
  "overallSummary": "<A 2–3 sentence, encouraging overview that immediately references a core tension you identified.>",
  "keyInsights": [
    {{
      "title": "<Insight 1: A short, powerful title describing a core theme (e.g., 'The Architect of Stability').>",
      "description": "<A short paragraph explaining this theme, referencing specific answers to show you were listening.>"
    }},
    {{
      "title": "<Insight 2: A title for the most interesting contradiction (e.g., 'The Gap Between Action and Feeling').>",
      "description": "<A paragraph explaining this tension, highlighting where their actions and feelings are misaligned.>"
    }}
  ],
  "actionableSteps": [
    {{
      "pillar": "Career",
      "recommendation": "<A recommendation that directly addresses the core tension found in their career answers.>",
      "firstStep": "<A small, tangible first step designed to help them explore their feelings about work, not just improve performance.>"
    }},
    {{
      "pillar": "Finances",
      "recommendation": "<A recommendation focused on the emotional side of money (e.g., building risk tolerance, aligning spending with values), since their habits are already strong.>",
      "firstStep": "<A practical, gentle first step to address the emotional aspect, not just the technical.>"
    }},
    {{
      "pillar": "Health",
      "recommendation": "<A recommendation focused on making their excellent health habits more enjoyable and sustainable for the long term.>",
      "firstStep": "<A specific, fun, and achievable action to reconnect their habits with positive feelings.>"
    }},
    {{
      "pillar": "Connections",
      "recommendation": "<A recommendation that targets the specific relational skill they seem to be avoiding (e.g., handling feedback, being vulnerable).>",
      "firstStep": "<A simple but powerful behavioural experiment they can try in their next conversation.>"
    }}
  ]
}}

**Here are their questionnaire responses:**
{conversation_text}
"""
    print("Final Prompt to Bedrock:", prompt)
    sys.stdout.flush() 

    request_body = {"anthropic_version": "bedrock-2023-05-31", "max_tokens": 4000, "messages": [{"role": "user", "content": prompt}]}
    response = bedrock_runtime.invoke_model(body=json.dumps(request_body), modelId=BEDROCK_MODEL_ID)
    response_body = json.loads(response.get('body').read())
    
    ai_response_text = response_body['content'][0]['text']
    
    print("Raw AI Response Text:", ai_response_text)
    sys.stdout.flush()
    
    return json.loads(ai_response_text)

# --- Main Lambda Handler ---
def lambda_handler(event, context):
    cors_headers = get_cors_headers(event)
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers, 'body': ''}

    try:
        user_id = get_user_id_from_token(event)
        http_method = event.get('httpMethod')

        if http_method == 'POST':
            body = json.loads(event.get('body', '{}'))
            answers = body.get('answers')
            if not answers or not isinstance(answers, dict):
                return {'statusCode': 400, 'headers': cors_headers, 'body': json.dumps({'error': 'Missing or invalid "answers" object.'})}
            
            summary_result = generate_summary_from_answers(answers)
            save_summary_to_db(user_id, summary_result)
            update_user_completion_status(user_id)
            
            return {'statusCode': 200, 'headers': cors_headers, 'body': json.dumps(summary_result)}

        elif http_method == 'GET':
            print(f"Fetching summary for userId: {user_id}")
            sys.stdout.flush()
            response = answers_table.get_item(Key={'userId': user_id})
            item = response.get('Item')
            
            if item and 'selfDiscoverySummary' in item:
                print(f"Found summary for userId: {user_id}")
                sys.stdout.flush()
                return {'statusCode': 200, 'headers': cors_headers, 'body': json.dumps(item['selfDiscoverySummary'], cls=DecimalEncoder)}
            else:
                print(f"No summary found for userId: {user_id}")
                sys.stdout.flush()
                return {'statusCode': 404, 'headers': cors_headers, 'body': json.dumps({'message': 'Summary not found.'})}
        
        else:
            return {'statusCode': 405, 'headers': cors_headers, 'body': json.dumps({'error': 'Method Not Allowed'})}

    except ValueError as ve:
        return {'statusCode': 401, 'headers': cors_headers, 'body': json.dumps({'error': str(ve)})}
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        sys.stdout.flush()
        return {'statusCode': 500, 'headers': cors_headers, 'body': json.dumps({'error': 'An internal server error occurred.'})}
import json
import boto3
import os
import jwt # PyJWT library for decoding the token

# --- Configuration from Environment Variables ---
# Pulls configuration from the Lambda environment variables for security and flexibility.
TABLE_NAME = os.environ.get('TABLE_NAME', 'futureselfquestionnaire')
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')

# A list of frontend domains that are allowed to access this API.
ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "https://infinitegame.live",
    "https://infinite-game-live.lovable.app",
    "https://997cdcc2-64fd-4803-ba8b-2c36d9d662b3.lovableproject.com"
]

# --- AWS Service Clients ---
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(TABLE_NAME)


def get_auth_token(event):
    """
    Extracts the Bearer token from the request headers in a case-insensitive manner.
    """
    headers = event.get('headers', {})
    for key, value in headers.items():
        if key.lower() == 'authorization':
            return value.split(' ')[1] if value.startswith('Bearer ') else None
    return None


def lambda_handler(event, context):
    """
    Main Lambda handler that validates the origin, handles CORS preflight requests,
    authenticates the user via JWT, and saves questionnaire progress to DynamoDB.
    """
    print(f"Received event: {json.dumps(event, indent=2)}")

    # --- CORS Headers ---
    # Determine the correct CORS origin header to send back.
    origin = event.get('headers', {}).get('origin')
    cors_headers = {
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
    }
    if origin in ALLOWED_ORIGINS:
        cors_headers['Access-Control-Allow-Origin'] = origin

    # --- CORS Preflight Request Handling ---
    # Browsers send an OPTIONS request first to check permissions.
    if event.get('httpMethod') == 'OPTIONS':
        print("Handling CORS preflight request")
        return {'statusCode': 200, 'headers': cors_headers, 'body': ''}

    # --- Main Logic ---
    try:
        if not JWT_SECRET_KEY:
            print("Error: JWT_SECRET_KEY environment variable is not set.")
            raise ValueError("Server configuration error: JWT secret is missing.")

        # --- Authentication ---
        token = get_auth_token(event)
        if not token:
            print("Error: Missing or invalid Authorization header.")
            return {
                'statusCode': 401,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Unauthorized: Missing or invalid token.'})
            }

        decoded_token = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
        user_id = decoded_token.get('sub')
        if not user_id:
            print("Error: 'sub' claim missing from JWT.")
            return {
                'statusCode': 401,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Unauthorized: Invalid token payload.'})
            }
        
        print(f"Authenticated user with ID: {user_id}")

        # --- Data Processing ---
        body = json.loads(event.get('body', '{}'))

        # SECURITY: Overwrite any userId in the body with the one from the token.
        item_to_save = body
        item_to_save['userId'] = user_id

        print(f"Attempting to save item for userId: {user_id}")

        # --- Database Operation ---
        table.put_item(Item=item_to_save)

        print(f"Successfully saved data for userId: {user_id}")

        # --- Success Response ---
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'message': 'Progress saved successfully.'})
        }

    # --- Error Handling ---
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError) as e:
        print(f"JWT Error: {e}")
        return {'statusCode': 401, 'headers': cors_headers, 'body': json.dumps({'error': f'Unauthorized: {str(e)}'})}
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': 'An internal server error occurred.'})
        }

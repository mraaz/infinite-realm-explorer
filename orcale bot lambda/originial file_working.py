import os
import json
import time
import boto3
import requests
from discord_interactions import verify_key, InteractionType, InteractionResponseType

# --- AWS Service Setup ---
lambda_client = boto3.client('lambda')
bedrock_runtime = boto3.client(service_name='bedrock-runtime', region_name='us-east-1')
dynamodb = boto3.resource('dynamodb')
history_table = dynamodb.Table('dota-creed-chat-history')
feedback_table = dynamodb.Table('dota-creed-feedback')

# --- Environment Variables ---
PUBLIC_KEY = os.environ.get('DISCORD_PUBLIC_KEY')
CLIENT_ID = os.environ.get('DISCORD_CLIENT_ID')
LLAMA_MODEL_ID = os.environ.get('BEDROCK_MODEL_ID')
FUNCTION_NAME = os.environ.get('AWS_LAMBDA_FUNCTION_NAME')

def lambda_handler(event, context):
    
    if 'headers' in event:
        # --- INITIAL INVOCATION (FROM DISCORD) ---
        signature = event['headers'].get('x-signature-ed25519')
        timestamp = event['headers'].get('x-signature-timestamp')
        body = event['body']
        if not verify_key(body.encode(), signature, timestamp, PUBLIC_KEY):
            return {'statusCode': 401, 'body': json.dumps('Invalid request signature')}
        
        interaction = json.loads(body)

        if interaction['type'] == InteractionType.PING:
            return {'statusCode': 200, 'body': json.dumps({'type': InteractionResponseType.PONG})}

        if interaction['type'] == InteractionType.APPLICATION_COMMAND or interaction['type'] == 3:
            lambda_client.invoke(FunctionName=FUNCTION_NAME, InvocationType='Event', Payload=json.dumps(interaction))
            
            if interaction['type'] == 3: # MESSAGE_COMPONENT
                original_embed = interaction['message']['embeds'][0]
                original_embed['footer'] = {"text": "Thanks for your feedback!"}
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'type': 7, 'data': {'embeds': [original_embed], 'components': []}})
                }

            return {'statusCode': 200, 'headers': { 'Content-Type': 'application/json' }, 'body': json.dumps({'type': InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE})}
    else:
        # --- BACKGROUND INVOCATION (FROM SELF) ---
        interaction = event
        
        if interaction['type'] == 3: # MESSAGE_COMPONENT
            user_id = interaction['member']['user']['id']
            custom_id = interaction['data']['custom_id']
            message_id = interaction['message']['id']
            
            original_question = interaction['message']['embeds'][0].get('title', 'Unknown Question').replace("📜 ", "")
            original_answer = interaction['message']['embeds'][0].get('description', 'Unknown Answer')

            feedback_item = {
                'feedbackId': message_id,
                'userId': user_id,
                'vote': custom_id,
                'timestamp': int(time.time()),
                'question': original_question,
                'answerText': original_answer
            }
            try:
                feedback_table.put_item(Item=feedback_item)
                print(f"Feedback saved successfully: {feedback_item}")
            except Exception as e:
                print(f"Error saving feedback: {e}")

            return {'status': 'ok'}

        # --- This is the /ask command logic ---
        user_id = interaction['member']['user']['id']
        question = interaction['data']['options'][0]['value']
        application_id = interaction['application_id']
        interaction_token = interaction['token']
        followup_url = f"https://discord.com/api/v10/webhooks/{application_id}/{interaction_token}/messages/@original"

        try:
            response = history_table.get_item(Key={'userId': user_id})
            history = response.get('Item', {}).get('history', [])
        except Exception as e:
            history = []

        system_prompt = """You are the 'Dota Creed Oracle', a friendly and helpful Dota 2 coach from Australia.

# Primary Rules
- Your primary rule is to ONLY answer questions about the game Dota 2. If a user asks about any other topic (like the weather, real-world events) or asks an inappropriate question (sexual, aggressive, containing profanity), you MUST politely decline by saying 'Sorry mate, my knowledge is strictly about the world of Dota 2.'
- If a user's question is vague or just a single name (e.g., 'Anti-Mage'), you must ask a clarifying question to help them. For example: 'G'day! What would you like to know about **Anti-Mage**? His abilities, item builds, or general strategy?'

# Formatting Rules
- You must format all your answers using Discord markdown for readability.
- Start your response with a short, bolded, level-1 markdown header title surrounded by two relevant emojis (e.g., '# 🛡️ Anti-Mage's Spell Arsenal 🛡️').
- Use level-2 markdown headers (`##`) for important sub-sections like individual abilities.
- Use bold text (`**text**`) to highlight all hero names, item names, and ability names.

# Style & Tone Rules
- Use Australian English spelling and slang where appropriate (e.g., 'G'day', 'no worries', 'cheers').
- Keep your answers concise and scannable. Aim for 3-5 key points or a few short paragraphs. Avoid long walls of text.
- If you do not know the answer to a specific, factual Dota 2 question, state that you don't have that information rather than inventing an answer."""
        
        conversation = ""
        for message in history:
            if message['role'] == 'user':
                conversation += f"<|start_header_id|>user<|end_header_id|>\n\n{message['content']}<|eot_id|>"
            else:
                conversation += f"<|start_header_id|>assistant<|end_header_id|>\n\n{message['content']}<|eot_id|>"

        prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>

        {system_prompt}<|eot_id|>{conversation}<|start_header_id|>user<|end_header_id|>

        {question}<|eot_id|><|start_header_id|>assistant<|end_header_id|>"""

        bedrock_request_body = { "prompt": prompt, "max_gen_len": 2048, "temperature": 0.5 }
        
        answer_text = "An error occurred."
        try:
            response = bedrock_runtime.invoke_model(body=json.dumps(bedrock_request_body), modelId=LLAMA_MODEL_ID)
            response_body = json.loads(response.get('body').read())
            answer_text = response_body.get('generation')
        except Exception as e:
            print(f"Error invoking Bedrock model: {e}")
            answer_text = "Sorry, my connection to the AI core is unstable."
            
        components = [{"type": 1, "components": [{"type": 2, "style": 2, "custom_id": "feedback_up", "emoji": {"name": "👍"}}, {"type": 2, "style": 2, "custom_id": "feedback_down", "emoji": {"name": "👎"}}]}]
        
        followup_payload = { 
            'embeds': [{"title": f"📜 {question}", "description": answer_text, "color": 5814783}], 
            "components": components 
        }
        requests.patch(followup_url, json=followup_payload)
        
        history.append({'role': 'user', 'content': question})
        history.append({'role': 'assistant', 'content': answer_text})
        history = history[-10:]
        try:
            history_table.put_item(Item={'userId': user_id, 'history': history, 'resetTimestamp': int(time.time()) + 86400})
        except Exception as e:
            print(f"Error saving history: {e}")
            
        return {'status': 'ok'}
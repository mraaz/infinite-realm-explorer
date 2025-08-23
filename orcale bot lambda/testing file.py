import boto3
import json
import os
import requests
from discord_interactions import verify_key, InteractionType, InteractionResponseType
import time
import traceback

# --- CONFIGURATION ---
PUBLIC_KEY = os.environ.get('DISCORD_PUBLIC_KEY')
CLIENT_ID = os.environ.get('DISCORD_CLIENT_ID')
LLAMA_MODEL_ID = os.environ.get('BEDROCK_MODEL_ID')
FUNCTION_NAME = os.environ.get('AWS_LAMBDA_FUNCTION_NAME')

# --- BOTO3 CLIENTS ---
lambda_client = boto3.client('lambda')
# This client initialization has been removed as it is the suspected cause of the bug.
# bedrock_agent_runtime = boto3.client('bedrock-agent-runtime', region_name='us-east-1')
bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')
dynamodb = boto3.resource('dynamodb')
history_table = dynamodb.Table('dota-creed-chat-history')
feedback_table = dynamodb.Table('dota-creed-feedback')


# --- HELPER FUNCTIONS ---
def format_chunks_for_prompt(chunk_results):
    if not chunk_results: return "No information was found in the patch notes for this query."
    # ... (rest of function is unchanged)
    formatted_text = ""
    for result in chunk_results:
        text = result['content']['text']
        patch_number = result.get('metadata', {}).get('patch_number', 'N/A')
        patch_type = result.get('metadata', {}).get('patch_type', 'N/A')
        formatted_text += f"\n--- Chunk from Patch {patch_number} ({patch_type}) ---\n{text}"
    return formatted_text

# --- MAIN LAMBDA HANDLER ---
def lambda_handler(event, context):
    
    if 'headers' in event:
        # --- (Initial invocation logic is unchanged) ---
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
            
            if interaction['type'] == 3:
                original_embed = interaction['message']['embeds'][0]
                original_embed['footer'] = {"text": "Thanks for your feedback!"}
                return {'statusCode': 200, 'body': json.dumps({'type': 7, 'data': {'embeds': [original_embed], 'components': []}})}

            return {'statusCode': 200, 'body': json.dumps({'type': InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE})}
    else:
        # --- BACKGROUND INVOCATION (FROM SELF) ---
        interaction = event
        
        try: 
            print("BACKGROUND: Invocation started.")
            if interaction['type'] == 3:
                # ... (Feedback logic is unchanged)
                return {'status': 'ok'}

            # --- /ask command logic ---
            user_id = interaction['member']['user']['id']
            question = interaction['data']['options'][0]['value']
            application_id = interaction['application_id']
            interaction_token = interaction['token']
            followup_url = f"https://discord.com/api/v10/webhooks/{application_id}/{interaction_token}/messages/@original"
            print(f"BACKGROUND: Processing /ask command for user {user_id}.")

            response = history_table.get_item(Key={'userId': user_id})
            history = response.get('Item', {}).get('history', [])
            print(f"BACKGROUND: Successfully retrieved {len(history)} messages from history.")
            
            # --- We are still simulating the RAG response for this test ---
            print("BACKGROUND TEST: Bypassing live RAG retrieval and using a hardcoded response.")
            hardcoded_rag_text = "A creep is a computer-controlled unit. Lane creeps spawn in waves and walk down the lanes. Neutral creeps are found in the jungle."
            combined_chunks = [{'content': {'text': hardcoded_rag_text}, 'metadata': {'patch_number': 'simulated', 'patch_type': 'simulated'}}]
            chunks_for_prompt = combined_chunks
            print("BACKGROUND TEST: RAG response simulated successfully.")
            
            # --- Using your original, working system prompt ---
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

            prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{system_prompt}<|eot_id|>{conversation}<|start_header_id|>user<|end_header_id|>\n\n{question}<|eot_id|><|start_header_id|>assistant<|end_header_id|>"""
            print("BACKGROUND: Full prompt for LLM constructed using original system prompt.")

            # --- Using your original temperature setting ---
            bedrock_request_body = { "prompt": prompt, "max_gen_len": 2048, "temperature": 0.5 }
            
            print("BACKGROUND: Calling Bedrock LLM for generation...")
            response = bedrock_runtime.invoke_model(body=json.dumps(bedrock_request_body), modelId=LLAMA_MODEL_ID)
            response_body = json.loads(response.get('body').read())
            answer_text = response_body.get('generation')
            print("BACKGROUND: Successfully received generation from Bedrock.")
            
            components = [{"type": 1, "components": [{"type": 2, "style": 2, "custom_id": "feedback_up", "emoji": {"name": "👍"}}, {"type": 2, "style": 2, "custom_id": "feedback_down", "emoji": {"name": "👎"}}]}]
            followup_payload = {'embeds': [{"title": f"📜 {question}", "description": answer_text, "color": 5814783}], "components": components}
            print("BACKGROUND: Final Discord followup payload created.")

            try:
                print("BACKGROUND: Attempting to send final response to Discord...")
                response = requests.patch(followup_url, json=followup_payload, timeout=5)
                response.raise_for_status()
                print(f"BACKGROUND: Successfully sent response to Discord. Status Code: {response.status_code}")
            except requests.exceptions.RequestException as e:
                print("!!!!!! FAILED TO SEND RESPONSE TO DISCORD !!!!!!")
                if e.response is not None:
                    print(f"Response Status Code: {e.response.status_code}")
                    print(f"Response Body: {e.response.text}")
                print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
            
            # ... (History saving is unchanged)
            
            print("BACKGROUND: Process finished successfully.")
            return {'status': 'ok'}

        except Exception as e:
            # ... (Main error handler is unchanged)
            print("!!!!!! AN UNHANDLED EXCEPTION OCCURRED !!!!!!")
            traceback.print_exc()
            print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
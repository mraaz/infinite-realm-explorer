import boto3
import json
import os
import requests
from discord_interactions import verify_key, InteractionType, InteractionResponseType
import time
import traceback

# --- UNIFIED CONFIGURATION ---
PUBLIC_KEY = os.environ.get('DISCORD_PUBLIC_KEY')
CLIENT_ID = os.environ.get('DISCORD_CLIENT_ID')
KNOWLEDGE_BASE_ID = os.environ.get('KNOWLEDGE_BASE_ID')
MODEL_ID = os.environ.get('BEDROCK_MODEL_ID', "meta.llama3-70b-instruct-v1:0")
REGION = os.environ.get("AWS_REGION", "us-east-1")
FUNCTION_NAME = os.environ.get('AWS_LAMBDA_FUNCTION_NAME')
MAX_CHUNKS_TO_PASS = 20
MAX_TOPICS_FOR_PASS_2 = 10

# --- BOTO3 CLIENTS ---
lambda_client = boto3.client('lambda')
bedrock_agent_runtime = boto3.client('bedrock-agent-runtime', region_name=REGION)
bedrock_runtime = boto3.client('bedrock-runtime', region_name=REGION)
dynamodb = boto3.resource('dynamodb')
history_table = dynamodb.Table('dota-creed-chat-history')
feedback_table = dynamodb.Table('dota-creed-feedback')

# --- RAG HELPER FUNCTIONS ---
def retrieve_from_kb(kb_id, question, patch_filter_type, topics=None):
    retrieval_config = {'vectorSearchConfiguration': {'numberOfResults': 10}}
    base_filter = { 'equals': { 'key': 'patch_type', 'value': patch_filter_type } }
    final_filter = base_filter
    if topics:
        topic_filters = [{'equals': {'key': 'major_topics', 'value': topic}} for topic in topics]
        if topic_filters:
            final_filter = { 'andAll': [ base_filter, {'orAll': topic_filters} ] }
    retrieval_config['vectorSearchConfiguration']['filter'] = final_filter
    print(f"Retrieving with filter: {json.dumps(final_filter)}")
    response = bedrock_agent_runtime.retrieve(
        knowledgeBaseId=kb_id, retrievalQuery={'text': question}, retrievalConfiguration=retrieval_config
    )
    return response.get('retrievalResults', [])

def format_chunks_for_prompt(chunk_results):
    if not chunk_results: return "No information was found in the patch notes for this query."
    chunk_results.sort(key=lambda x: (x.get('metadata', {}).get('patch_type', 'z'), x.get('metadata', {}).get('patch_number', '0')), reverse=True)
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
        # --- INITIAL INVOCATION (FROM DISCORD VIA API GATEWAY) ---
        signature = event['headers'].get('x-signature-ed25519')
        timestamp = event['headers'].get('x-signature-timestamp')
        body = event['body']
        if not verify_key(body.encode(), signature, timestamp, PUBLIC_KEY):
            return {'statusCode': 401, 'body': json.dumps('Invalid request signature')}
        
        interaction = json.loads(body)

        if interaction['type'] == InteractionType.PING:
            return {'statusCode': 200, 'body': json.dumps({'type': InteractionResponseType.PONG})}

        if interaction['type'] == InteractionType.APPLICATION_COMMAND or interaction['type'] == 3:
            # Asynchronously invoke self to handle the logic
            lambda_client.invoke(FunctionName=FUNCTION_NAME, InvocationType='Event', Payload=json.dumps(interaction))
            
            if interaction['type'] == 3: # MESSAGE_COMPONENT (Button press)
                original_embed = interaction['message']['embeds'][0]
                original_embed['footer'] = {"text": "Thanks for your feedback!"}
                return {'statusCode': 200, 'body': json.dumps({'type': 7, 'data': {'embeds': [original_embed], 'components': []}})}

            # DEFER RESPONSE for a slash command
            return {'statusCode': 200, 'body': json.dumps({'type': InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE})}
    else:
        # --- BACKGROUND INVOCATION (FROM SELF) ---
        interaction = event
        
        try: 
            if interaction['type'] == 3: # Handle Feedback Button
                user_id = interaction['member']['user']['id']
                custom_id = interaction['data']['custom_id']
                message_id = interaction['message']['id']
                original_question = interaction['message']['embeds'][0].get('title', 'Unknown Question').replace("📜 ", "")
                original_answer = interaction['message']['embeds'][0].get('description', 'Unknown Answer')
                feedback_item = {'feedbackId': message_id, 'userId': user_id, 'vote': custom_id, 'timestamp': int(time.time()), 'question': original_question, 'answerText': original_answer}
                feedback_table.put_item(Item=feedback_item)
                return {'status': 'ok'}

            # --- /ask command logic ---
            user_id = interaction['member']['user']['id']
            question = interaction['data']['options'][0]['value']
            application_id = interaction['application_id']
            interaction_token = interaction['token']
            followup_url = f"https://discord.com/api/v10/webhooks/{application_id}/{interaction_token}/messages/@original"

            response = history_table.get_item(Key={'userId': user_id})
            history = response.get('Item', {}).get('history', [])
            
            initial_major = retrieve_from_kb(KNOWLEDGE_BASE_ID, question, 'major_update')
            initial_balance = retrieve_from_kb(KNOWLEDGE_BASE_ID, question, 'balance_update')
            discovered_topics = set()
            for result in initial_major + initial_balance:
                if 'major_topics' in result.get('metadata', {}) and isinstance(result['metadata']['major_topics'], list):
                    discovered_topics.update(result['metadata']['major_topics'])
            
            final_major, final_balance = initial_major, initial_balance
            if discovered_topics:
                limited_topics = list(discovered_topics)[:MAX_TOPICS_FOR_PASS_2]
                final_major = retrieve_from_kb(KNOWLEDGE_BASE_ID, question, 'major_update', limited_topics)
                final_balance = retrieve_from_kb(KNOWLEDGE_BASE_ID, question, 'balance_update', limited_topics)

            seen_texts = set()
            combined_chunks = [result for result in final_major + final_balance if result['content']['text'] not in seen_texts and not seen_texts.add(result['content']['text'])]
            chunks_for_prompt = combined_chunks[:MAX_CHUNKS_TO_PASS]
            
            conversation = ""
            for message in history:
                role = 'user' if message['role'] == 'user' else 'assistant'
                conversation += f"<|start_header_id|>{role}<|end_header_id|>\n\n{message['content']}<|eot_id|>"

            system_prompt = f"""You are the 'Dota Creed Oracle', a helpful and knowledgeable Dota 2 coach from Australia.
# Primary Rules
- Your primary directive is to be factually accurate. Your answers must be based on the information provided in the 'Retrieved Chunks'.
- Use the conversation history to understand the context of follow-up questions.
- **Crucially, if the information required to answer the user's question is not present in the 'Retrieved Chunks' and is not part of your general knowledge, you MUST respond with 'Sorry, I don't have that information.' Do not invent, guess, or fabricate any details.**
# Style & Tone Rules
- You must use Australian English for all spelling and grammar (e.g., 'armour', 'specialise').
- You must NOT use Australian slang (e.g., 'G'day', 'mate', 'cheers'). Maintain a helpful and professional coaching tone.
# Formatting Rules
- Use Discord markdown.
- Use bold (`**text**`) for all hero, item, and ability names.
Retrieved Chunks:
{format_chunks_for_prompt(chunks_for_prompt)}
"""
            prompt = (f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{system_prompt}<|eot_id|>{conversation}"
                      f"<|start_header_id|>user<|end_header_id|>\n\n{question}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n")

            generation_response = bedrock_runtime.invoke_model(
                modelId=MODEL_ID, body=json.dumps({"prompt": prompt, "max_gen_len": 2048, "temperature": 0.2})
            )
            response_body = json.loads(generation_response['body'].read())
            answer_text = response_body['generation']
            
            components = [{"type": 1, "components": [{"type": 2, "style": 2, "custom_id": "feedback_up", "emoji": {"name": "👍"}}, {"type": 2, "style": 2, "custom_id": "feedback_down", "emoji": {"name": "👎"}}]}]
            followup_payload = {'embeds': [{"title": f"📜 {question}", "description": answer_text, "color": 5814783}], "components": components}
            
            try:
                response = requests.patch(followup_url, json=followup_payload, timeout=5)
                response.raise_for_status()
                print(f"Successfully sent response to Discord. Status Code: {response.status_code}")
            except requests.exceptions.RequestException as e:
                print("!!!!!! FAILED TO SEND RESPONSE TO DISCORD !!!!!!")
                if e.response is not None:
                    print(f"Response Status Code: {e.response.status_code}")
                    print(f"Response Body: {e.response.text}")
                print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
            
            history.append({'role': 'user', 'content': question})
            history.append({'role': 'assistant', 'content': answer_text})
            history = history[-10:]
            history_table.put_item(Item={'userId': user_id, 'history': history, 'resetTimestamp': int(time.time()) + 86400})
            
            return {'status': 'ok'}

        except Exception as e:
            print("!!!!!! AN UNHANDLED EXCEPTION OCCURRED !!!!!!")
            traceback.print_exc()
            print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
            
            try:
                followup_url = f"https://discord.com/api/v10/webhooks/{interaction['application_id']}/{interaction['token']}/messages/@original"
                error_message = "Sorry, a critical error occurred while processing your request. The development team has been notified."
                requests.patch(followup_url, json={'embeds': [{"title": f"📜 {interaction['data']['options'][0]['value']}", "description": error_message, "color": 15548997}]})
            except Exception as followup_e:
                print(f"Failed to send error message to Discord: {followup_e}")

            return {'status': 'error', 'error': str(e)}
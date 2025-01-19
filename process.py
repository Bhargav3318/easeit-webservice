import json
import boto3

def process_data(data):
    # Construct the prompt for the AI model
    prompt_text = (
        f"On the dates between {data['start_date']} and {data['end_date']}, "
        f"I am planning a trip with a budget of {data['budget']} USD for {data['adults']} adults "
        f"and {data['children']} children. Some preferences for the trip are: {data['preferences']}. "
        "Please provide a travel plan within my budget and list activities I can do during the trip."
    )

    # Prepare the request payload
    payload = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 200,
        "top_k": 250,
        "stopSequences": [],
        "temperature": 1,
        "top_p": 0.999,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt_text
                    }
                ]
            }
        ]
    }

    # Convert payload to JSON format
    body = json.dumps(payload)
    model_id = "anthropic.claude-3-5-haiku-20241022-v1:0"

    try:
        # Initialize the AWS Bedrock client
        bedrock = boto3.client(service_name="bedrock-runtime", region_name="us-east-2")

        # Invoke the model (WITHOUT performanceConfigLatency)
        response = bedrock.invoke_model(
            modelId=model_id,
            contentType="application/json",
            accept="application/json",
            body=body
        )

        # Parse the response from the AI model
        response_body = json.loads(response.get("body").read())
        response_text = response_body.get('content', [{'text': 'No response generated'}])[0]['text']

        return response_text

    except Exception as e:
        return f"Error processing trip plan: {e}"

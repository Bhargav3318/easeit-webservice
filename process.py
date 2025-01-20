import json
import boto3

def process_data(data):
    prompt_text = (
        f"On the dates between {data['start_date']} and {data['end_date']}, "
        f"I am planning a trip with a budget of {data['budget']} USD for {data['adults']} adults "
        f"and {data['children']} children. Some preferences for the trip are: {data['preferences']}. "
        "Please provide a travel plan within my budget and list activities I can do during the trip.give me in a structured way day by day and in bulletpoints every day activities and types of food etc make it a little breif"
    )

    payload = {
        "prompt": prompt_text,
        "max_gen_len": 512,
        "temperature": 0.5,
        "top_p": 0.9
    }

    body = json.dumps(payload)

    model_id = "meta.llama3-3-70b-instruct-v1:0"  # Updated model ID for on-demand
    region = "us-east-2"

    try:
        bedrock = boto3.client(service_name="bedrock-runtime", region_name=region)

        response = bedrock.invoke_model(
            modelId=model_id,
            contentType="application/json",
            accept="application/json",
            body=body
        )

        response_body = json.loads(response['body'].read().decode('utf-8'))
        response_text = response_body.get('generation', 'No response generated')

        return response_text

    except Exception as e:
        return f"Error processing trip plan: {e}"


import json
import boto3

def process_data(data):
    prompt_text = (
    f"I am planning a trip from {data['city']}, {data['state']}, {data['country']} "
    f"for {data['adults']} adult(s) and {data['children']} child(ren) "
    f"from {data['start_date']} to {data['end_date']}. "
    f"My total budget is {data['budget']} USD. "
    f"My preferences include: {data['preferences']}. "
    f"It will be a {data['travel_type']} trip. "

    "Generate a single, concise, and structured travel itinerary that optimally utilizes my budget without exceeding it. "
    "Ensure the response is in the following format and does not contain duplicate content:"

    "\nDay 1: [Title]"
    "\nActivities per day:"
    "\n  - [Activity name], Cost: $[amount], Time: [time]"
    "\nAccommodation:"
    "\n  - [Hotel name], Cost: $[amount]"
    "\nMeals:"
    "\n  - [Meal at Restaurant], Cost: $[amount], Time: [time]"
    "\nKey Highlight:"
    "\n  - [Brief highlight]"
    "the budget is for the all people combined so give resonse accordingly and utilze full budget in single and first response and end the response"
    "calculate lunch,breakfast,dinner etc for all people combined"
    "For subsequent days, follow the same format. Include travel modes (bus, flight, train) with respective costs and times. "
    "Plan the return journey and its cost. Fully utilize the budget by adding additional experiences without repeating the plan. "
    "Limit the response to a single itinerary. Do not add explanations, disclaimers, or repetitions. "
    "Stop the response after providing the total estimated trip cost as follows:"

    "\nTotal Estimated Cost: $[amount]"
)



    payload = {
        "prompt": prompt_text,
        "max_gen_len": 1212,
        "temperature": 0.5,
        "top_p": 0.8
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

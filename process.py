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

    "process and understand and find best solution and Generate a original single, concise, and structured travel itinerary that optimally utilizes my budget without exceeding it."
    "Ensure the response is in the following format and does not contain duplicate content:"
    "\n Travel cost [type] [amount$] to [destination]"
    "\nDay 1: [Title]"
    "\nActivities per day:"
    "\n  - [Activity name], Cost: $[amount], Time: [time]"
    "\nAccommodation:"
    "\n  - [Hotel name], Cost: $[amount]"
    "\nMeals:"
    "\n  - [Meal at Restaurant], Cost: $[amount], Time: [time]"
    "\nKey Highlight:"
    "\n  - [Brief highlight]"

    "mention specific location each tile like names of the locations and how to go there"
    "the budget is for the all people combined so give resonse accordingly and utilze full budget in single and first response and end the response"
    "calculate lunch,breakfast,dinner etc for all people combined"
    "once the first and single response generated dont make and any changes and leave it."
    "For subsequent days, follow the same format. Include travel modes (bus, flight, train) with respective costs and times. "
    "Plan the return journey and its cost. Fully utilize the budget by adding additional experiences without repeating the plan. "
    "Limit the response to a single itinerary. Do not add explanations, disclaimers, or repetitions. "
    "Stop the response after providing the total estimated trip cost as follows:"
    "give just the correct data in first single response dont repeat the responces and total estimated cost should be the total money spent in the trip"
    "\nTotal Estimated Cost: $[amount]"
    "end response here dont generate any further"
    """example
        Travel cost Flight $200 to Asheville, North Carolina
            Day 1: Adventure Begins
            - Activities per day:

            - Whitewater Rafting, Cost: $80, Time: 9:00 AM - 12:00 PM
            - Zip Line Canopy Tour, Cost: $60, Time: 2:00 PM - 4:00 PM
            - Accommodation:

            - Hotel Indigo, Cost: $120
            - Meals:

            - Breakfast at The Early Girl Eatery, Cost: $20, Time: 7:00 AM - 8:00 AM
            - Lunch at The White Duck Taco Shop, Cost: $30, Time: 12:00 PM - 1:00 PM
            - Dinner at Buxton Hall Barbecue, Cost: $40, Time: 6:00 PM - 7:30 PM
            - Key Highlight:

            - Explore the scenic beauty of Asheville River Arts District
            Day 2: Nature Escapade
            - Activities per day:

            - Hiking at Pisgah National Forest, Cost: $0, Time: 8:00 AM - 12:00 PM
            - LaZoom Comedy Tour, Cost: $30, Time: 2:00 PM - 4:00 PM
            - Accommodation:

            - Hotel Indigo, Cost: $120
            - Meals:

            - Breakfast at The Nightbell, Cost: $25, Time: 7:00 AM - 8:00 AM
            - Lunch at The Lobster Trap, Cost: $35, Time: 12:00 PM - 1:00 PM
            - Dinner at Curate, Cost: $50, Time: 6:00 PM - 7:30 PM
            - Key Highlight:

            - Discover the vibrant street art in Downtown Asheville
            Day 3: Return Journey
            - Activities per day:

            - Asheville River Arts Market, Cost: $10, Time: 9:00 AM - 12:00 PM
            Travel cost Flight $200 to Orlando, Florida
            Total Estimated Cost: $485
    
    """
    "give 2 different plans plan1: and plan 2:"
    "after generating total estimated cost end response there"
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

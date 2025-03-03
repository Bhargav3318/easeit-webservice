import requests
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)

# GROQ API Configuration
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_API_KEY = "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"  # Replace with your actual API key

def process_data(data):
    """Generates a structured travel itinerary using the Groq API"""
    try:
        # Create input prompt
        user_prompt = (
    f"Plan a detailed {data['travel_type']} trip for {data['adults']} adult(s) and {data['children']} "
    f"from {data['country']} (Zipcode: {data['zipcode']}). "
    f"to (these are optional fields) {data['city']}, {data['state']} , {data['country_optional']}"
    f"Trip duration: {data['start_date']} to {data['end_date']}."
    f"Budget: ${data['budget']} USD (total for all travelers). "
    f"Preferred travel mode: [Flight/Train/Bus] from {data['nearest_airport']}."
    f"Destination preferences: {data['preferences']}."
    "[start here]"
    "\n\n### **Travel Itinerary**\n"
    "\n- Departure: [Type: Flight/Train/Bus] from [Nearest Airport/Station] at [Time]. Duration: [X hours]. Cost: $[Amount]."
    "\n- Destination Arrival: [City, State, Country] at [Time]."
    "\n [Link to book with all inputs]"
    "\n\n**Day-wise Plan:**"

    "\n#### **Day 1: Arrival & Exploration [Date]**"
    "\n- Check-in at: [Hotel Name]. Cost: $[Amount]."
    "\n [Link to book with all inputs]"
    "\n- Morning Activity: [Activity Name]. Cost: $[Amount]. Time: [Start Time - End Time]."
    "\n [Link to book with all inputs]"
    "\n- Lunch: [Restaurant Name]. Cost: $[Amount]. Time: [Time]."
    "\n [Link to book with all inputs]"
    "\n- Afternoon Activity: [Activity Name]. Cost: $[Amount]. Time: [Start Time - End Time]."
    "\n [Link to book with all inputs]"
    "\n- Evening Exploration: [Landmark/Special Place]. Cost: $[Amount]."
    "\n [Link to book with all inputs]"
    "\n- Dinner: [Restaurant Name]. Cost: $[Amount]. Time: [Time]."
    "\n [Link to book with all inputs]"
    "\n- Accommodation: [Hotel Name]. Cost: $[Amount]."
    "\n [Link to book with all inputs]"

    "\n#### **Day 2 & Beyond:** (Repeat similar structure for each day)[date]"
    "\n- Morning Activity: [Activity Name]. Cost: $[Amount]. Time: [Start Time - End Time]."
    "\n [Link to book with all inputs]"
    "\n- Lunch: [Restaurant Name]. Cost: $[Amount]. Time: [Time]."
    "\n [Link to book with all inputs]"
    "\n- Afternoon Activity: [Activity Name]. Cost: $[Amount]. Time: [Start Time - End Time]."
    "\n [Link to book with all inputs]"
    "\n- Evening Exploration: [Landmark/Special Place]. Cost: $[Amount]."
    "\n [Link to book with all inputs]"
    "\n- Dinner: [Restaurant Name]. Cost: $[Amount]. Time: [Time]."
    "\n [Link to book with all inputs]"
    "\n- Accommodation: [Hotel Name]. Cost: $[Amount]."
    "\n [Link to book with all inputs]"

    "\n#### **Return Journey [date]**"
    "\n- Check-out from [Hotel Name]."
    "\n [Link to book with all inputs]"
    "\n- Departure: [Flight/Train/Bus] from [City] at [Time]. Cost: $[Amount]."
    "\n [Link to book with all inputs]"
    "\n- Arrival back at [Original City] at [Time]."
    "\n [Link to book with all inputs]"

    "\n### **Total Estimated Cost:**"
    "\n- Travel Cost: $[Amount]"
    "\n- Accommodation: $[Amount]"
    "\n- Meals: $[Amount]"
    "\n- Activities & Experiences: $[Amount]"
    "\n**Final Total Cost: $[Amount]** (Fully utilizing the budget)."
    "[end here]"

    "\n\n**Guidelines:**"
    "\n check start date and end date make plan for every day included complete trip and cover evry day."
    "\n- do not even give an extra letter other than the format given not even a single word just response should begin from **Travel Itinerary** and end at end make it professional"
    "\n dont give these type of response for the days 'Repeat similar structure for each day.' give different types of activities for the days. start to end for everyday dont skip make it all complete"
    "\n- Everything should be very accurate and no error is accepted must follow all guidelines."
    "\n - give very accurate links which will work first seee the link if the link is valid then give it. do this for every link"
    "\n- Use realistic pricing for flights, hotels, food, and activities."
    "\n- Include family-friendly activities if children are present."
    "\n- Ensure each day has a variety of experiences."
    "\n- Fully utilize the given budget without exceeding it and make no error at final estimation and prices."
    "\n- Do not repeat content. Generate a structured, single-response itinerary."
    "\n give links for every this like hotel bookings and accomedation , activity tickets etc for every thing and all inputs loded in the link"
    "\n make travel plans for best budget and time saving"
    "\n activities must me exciting depending upon adults and childern"
    "\n dont include '*' in your response"
)


        payload = {
            "model": "llama3-70b-8192",
            "messages": [
                {"role": "system", "content": "You are an expert travel planner. Generate an optimized itinerary."},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0.5,
            "max_tokens": 8191,
            "top_p": 0.8
        }

        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }

        # Send request to Groq API
        response = requests.post(GROQ_API_URL, headers=headers, json=payload)

        # Log API response
        logging.info(f"GROQ API Response: {response.text}")

        # Extract response text
        if response.status_code == 200:
            response_text = response.json().get("choices", [{}])[0].get("message", {}).get("content", "No response generated")
            return response_text
        else:
            return f"API Error: {response.status_code} - {response.text}"

    except Exception as e:
        logging.error(f"Error processing trip plan: {e}")
        return f"Error: {str(e)}"

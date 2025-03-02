from flask import Flask, render_template, request, jsonify
import json
from process import process_data

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/submit', methods=['POST'])
def submit():
    data = {
        'start_date': request.form.get('start_date'),
        'end_date': request.form.get('end_date'),
        'budget': request.form.get('budget'),
        'adults': request.form.get('adults'),
        'children': request.form.get('children'),
        'country': request.form.get('country'),
        'zipcode': request.form.get('zipcode', ''),  # Optional field
        'nearest_airport': request.form.get('nearest_airport', ''),  # Optional field
        'travel_type': request.form.get('travel_type'),
        'country_optional': request.form.get('country_optional', ''),  # Optional international field
        'state': request.form.get('state', ''),  # Optional field for national/international
        'city': request.form.get('city', ''),  # Optional field for national/international
        'preferences': request.form.get('preferences')
    }
    print(data)

    try:
        plan_text = process_data(data)
        formatted_plan = plan_text.split("\n")  # Convert response into a list for iteration in HTML
        
        return render_template('success.html', trip_plan=formatted_plan)

    except Exception as e:
        return jsonify({"error": str(e)})


def format_trip_plan(plan_text):
    """ Function to parse and structure the travel plan text into a dictionary """
    trip_plan = []
    lines = plan_text.split("\n")  # Splitting by newlines

    for line in lines:
        if line.strip():
            trip_plan.append(line.strip())  # Clean and add to the list

    return trip_plan


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
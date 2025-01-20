from flask import Flask, render_template, request, redirect, url_for, jsonify
import json
from process import process_data

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/submit', methods=['POST'])
def submit():
    data = {
        'start_date': request.form['start_date'],
        'end_date': request.form['end_date'],
        'budget': request.form['budget'],
        'adults': request.form['adults'],
        'children': request.form['children'],
        'preferences': request.form['preferences']
    }

    try:
        plan_text = process_data(data)

        # Convert the structured text to dictionary
        formatted_plan = format_trip_plan(plan_text)
        return render_template('success.html', trip_plan=formatted_plan)

    except Exception as e:
        return f"Error processing trip plan: {e}"

def format_trip_plan(plan_text):
    """ Function to parse and structure the travel plan text into a dictionary """
    trip_plan = []
    lines = plan_text.split("**")  # Splitting by '**' which indicates sections
    for line in lines:
        if line.strip():
            trip_plan.append(line.strip().replace('*', ''))  # Remove extra asterisks

    return trip_plan

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)


from flask import Flask, render_template, request, redirect, url_for
import json
import boto3
from datetime import datetime

from process import process_data

app = Flask(__name__)

def save_preference(data):
    try:
        
        with open('data/travel_preferences.json', 'r') as file:
            try:
                preferences = json.load(file)
            except json.JSONDecodeError:
                preferences = []
        
        # Add new data
        preferences.append({
            'id': len(preferences) + 1,
            'start_date': data['start_date'],
            'end_date': data['end_date'],
            'budget': float(data['budget']),
            'adults': int(data['adults']),
            'children': int(data['children']),
            'preferences': data['preferences']
        })
        
        # Save updated data
        with open('data/travel_preferences.json', 'w') as file:
            json.dump(preferences, file, indent=4)
        return True
    except Exception as e:
        print(f"Error saving data: {e}")
        return False

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/submit', methods=['POST'])
def submit():
    try:
        data = {
            'start_date': request.form['start_date'],
            'end_date': request.form['end_date'],
            'budget': request.form['budget'],
            'adults': request.form['adults'],
            'children': request.form['children'],
            'preferences': request.form['preferences']
        }
        
        if save_preference(data):
            plan = process_data(data)
            return redirect(url_for('success',trip_plan=plan))
        else:
            return "Error saving data", 500
    except Exception as e:
        print(f"Error processing form: {e}")
        return "Error processing form", 500

@app.route('/success')
def success():
    trip_plan=request.args.get('trip_plan', 'No trip plan available')
    return render_template('success.html',trip_plan=trip_plan)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
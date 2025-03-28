from flask import Flask, render_template, request, jsonify
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
        'zipcode': request.form.get('zipcode', ''),
        'nearest_airport': request.form.get('nearest_airport', ''),
        'travel_type': request.form.get('travel_type'),
        'country_optional': request.form.get('country_optional', ''),
        'state': request.form.get('state', ''),
        'city': request.form.get('city', ''),
        'preferences': request.form.get('preferences')
    }
    print(data)  # Debug: print form input data to console

    try:
        formatted_plan = process_data(data)
        return render_template('success.html', trip_plan=formatted_plan)
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

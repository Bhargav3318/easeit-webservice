from flask import Flask, jsonify, request
import json

app = Flask(__name__)

with open('menu_data.json', 'r') as file:
    menu = json.load(file)

@app.route('/menu', methods=['GET'])
def get_menu():
    return menu

@app.route('/menu/<day>', methods=['GET'])
def get_menu_for_day(day):
    day = day.capitalize()
    return jsonify(menu.get(day, {'message': f'No menu found for {day}'}))

@app.route('/menu/<day>', methods=['POST'])
def add_menu_item_for_day(day):
    day = day.capitalize()
    if day in menu:
        data = request.get_json()
        new_item = {"category": data['category'], "item": data['item']}
        menu[day].append(new_item)
        save_data()
        return jsonify(new_item), 201
    return jsonify({'message': f'No menu found for {day}'}), 404

@app.route('/menu/<day>', methods=['PUT'])
def update_menu_item_for_day(day):
    day = day.capitalize()
    if day in menu:
        data = request.get_json()
        for item in menu[day]:
            if item['category'] == data['category']:
                item['item'] = data['item']
                save_data()
                return jsonify(item)
        return jsonify({'message': f'Category not found for {day}'}), 404
    return jsonify({'message': f'No menu found for {day}'}), 404

def save_data():
    with open('menu_data.json', 'w') as file:
        json.dump(menu, file, indent=4)

if __name__ == '__main__':
    from waitress import serve
    serve(app, host="0.0.0.0", port=8080)

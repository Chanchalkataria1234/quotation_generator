import os
import json
from flask import Flask, jsonify, request, render_template, send_from_directory

app = Flask(__name__, template_folder='templates', static_folder='static')

CONFIG_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'config.json')

DEFAULT_CONFIG = {
    "resort_info": {
        "name": "MEERA VALLEY RESORT",
        "subtitle": "By Nexottel - Udaipur",
        "footer": "Meera Valley Resort By Nexottel | Udaipur | Quotation subject to availability"
    },
    "included_meals": {
        "breakfast": True,
        "lunch": True,
        "hi_tea": True,
        "dinner": True
    },
    "included_packages": {
        "room_only": True,
        "cp": True,
        "map": True,
        "ap": True,
        "ap_hi_tea": True
    },
    "booking_defaults": {
        "check_in": "2026-07-26T13:00",
        "check_out": "2026-07-27T10:00",
        "guests": 25,
        "guest_status": "Returning / Old Guest"
    },
    "included_rooms": {
        "double": True,
        "triple": True,
        "quad": True
    },
    "rooms": {
        "triple": {
            "quantity": 7,
            "rate": 2000,
            "inclusion": "1 mattress included in each room"
        },
        "double": {
            "quantity": 2,
            "rate": 1800,
            "inclusion": "Double occupancy"
        },
        "quad": {
            "quantity": 0,
            "rate": 2400,
            "inclusion": "Quad occupancy"
        }
    },
    "meal_rates": {
        "cp": 250,
        "map": 600,
        "ap": 950,
        "ap_hi_tea": 1250
    },
    "menus": {
        "breakfast": [
            "Chole Bature",
            "Poha",
            "Bread Butter",
            "Tea & Coffee"
        ],
        "lunch": [
            "Dal Fry",
            "Paneer Lababdar",
            "Sev Tomato",
            "Jeera Rice",
            "Tawa Roti",
            "Papad",
            "Achar",
            "Green Salad",
            "Rasmalai"
        ],
        "hi_tea": [
            "Peanut Salad",
            "Paneer Chilli",
            "Mix Pakora",
            "Green Salad",
            "Biscuit",
            "Tea",
            "Coffee"
        ],
        "dinner": [
            "Dal Tadka",
            "Paneer Butter Masala",
            "Mix Veg",
            "Jeera Rice",
            "Tawa Roti",
            "Papad",
            "Achar",
            "Green Salad",
            "Gulab Jamun"
        ]
    },
    "important_notes": [
        "Mattress charges are already included in the quoted room rates.",
        "Check-in Time: 1:00 PM.",
        "Check-out Time: 10:00 AM.",
        "40% advance payment is required for booking confirmation.",
        "Remaining payment must be cleared before check-in.",
        "No refund will be applicable within 15 days of arrival.",
        "The special old-guest discount is already included in the above prices.",
        "Hi Tea rate is \u20b9300 per person, included in the AP + Hi Tea package total.",
        "Final booking is subject to room availability at the time of confirmation."
    ]
}

def load_config():
    if not os.path.exists(CONFIG_PATH):
        save_config(DEFAULT_CONFIG)
        return DEFAULT_CONFIG
    try:
        with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return DEFAULT_CONFIG

def save_config(config_data):
    try:
        with open(CONFIG_PATH, 'w', encoding='utf-8') as f:
            json.dump(config_data, f, indent=2, ensure_ascii=False)
        return True
    except Exception:
        return False

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/api/config', methods=['GET'])
def get_config():
    return jsonify(load_config())

@app.route('/api/config', methods=['POST'])
def update_config():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    if save_config(data):
        return jsonify({"status": "success", "config": data})
    else:
        return jsonify({"error": "Failed to save configuration"}), 500

@app.route('/api/config/reset', methods=['POST'])
def reset_config():
    if save_config(DEFAULT_CONFIG):
        return jsonify({"status": "success", "config": DEFAULT_CONFIG})
    else:
        return jsonify({"error": "Failed to reset configuration"}), 500

if __name__ == '__main__':
    # Creating templates and static directories if they don't exist
    os.makedirs(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates'), exist_ok=True)
    os.makedirs(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'css'), exist_ok=True)
    os.makedirs(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'js'), exist_ok=True)
    
    app.run(host='127.0.0.1', port=5000, debug=True)

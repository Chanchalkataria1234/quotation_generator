import os
import json
import io
from datetime import datetime
from flask import Flask, jsonify, request, render_template, send_from_directory, send_file
from fpdf import FPDF

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

class QuotationPDF(FPDF):
    def __init__(self, footer_text):
        super().__init__(orientation="P", unit="mm", format="A4")
        self.footer_text = footer_text
        
    def footer(self):
        self.set_y(-15)
        self.set_draw_color(220, 220, 220)
        self.set_line_width(0.2)
        self.line(20, self.get_y(), 190, self.get_y())
        self.set_font("Helvetica", "", 8)
        self.set_text_color(102, 102, 102)
        self.cell(0, 10, self.footer_text, 0, 0, "C")

def format_datetime(datetime_str):
    if not datetime_str:
        return ''
    try:
        dt = datetime.strptime(datetime_str, "%Y-%m-%dT%H:%M")
        return dt.strftime("%d %B %Y, %I:%M %p")
    except Exception:
        return datetime_str

def format_currency(amount):
    try:
        val = int(amount)
        return f"Rs. {val:,}"
    except Exception:
        return f"Rs. {amount}"

def build_pdf(data):
    resort_info = data.get("resort_info", {})
    booking_defaults = data.get("booking_defaults", {})
    rooms = data.get("rooms", {})
    included_rooms = data.get("included_rooms", {})
    meal_rates = data.get("meal_rates", {})
    included_packages = data.get("included_packages", {})
    included_meals = data.get("included_meals", {})
    menus = data.get("menus", {})
    important_notes = data.get("important_notes", [])

    check_in_str = format_datetime(booking_defaults.get("check_in", ""))
    check_out_str = format_datetime(booking_defaults.get("check_out", ""))
    
    nights = 1
    try:
        ci = datetime.strptime(booking_defaults.get("check_in", ""), "%Y-%m-%dT%H:%M")
        co = datetime.strptime(booking_defaults.get("check_out", ""), "%Y-%m-%dT%H:%M")
        nights = max(1, (co - ci).days)
    except Exception:
        pass
        
    guests = booking_defaults.get("guests", 25)
    guest_status = booking_defaults.get("guest_status", "Returning / Old Guest")

    pdf = QuotationPDF(resort_info.get("footer", ""))
    pdf.set_auto_page_break(auto=True, margin=15)
    
    pdf.add_page()
    
    logo_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'meera_valley_logo.jpg')
    if not os.path.exists(logo_path):
        logo_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'meera_valley_logo.jpg')
        
    if os.path.exists(logo_path):
        pdf.image(logo_path, x=82.5, y=15, w=45)
        pdf.set_y(40)
    else:
        pdf.set_y(15)
        pdf.set_font("Helvetica", "B", 16)
        pdf.cell(0, 10, resort_info.get("name", "Resort"), ln=True, align="C")
        pdf.set_font("Helvetica", "", 10)
        pdf.cell(0, 5, resort_info.get("subtitle", ""), ln=True, align="C")
        pdf.ln(5)

    pdf.set_font("Helvetica", "B", 13)
    pdf.set_text_color(21, 115, 102)
    pdf.cell(0, 8, "PREMIUM STAY QUOTATION", ln=True, align="C")
    pdf.set_draw_color(21, 115, 102)
    pdf.set_line_width(0.5)
    pdf.line(70, pdf.get_y(), 140, pdf.get_y())
    pdf.ln(6)

    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(34, 34, 34)
    pdf.set_draw_color(221, 221, 221)
    pdf.set_line_width(0.2)
    
    def draw_table_cell(label, value, label_w, val_w, height):
        pdf.set_fill_color(238, 246, 246)
        pdf.set_font("Helvetica", "B", 9)
        pdf.cell(label_w, height, label, border=1, fill=True)
        pdf.set_fill_color(255, 255, 255)
        pdf.set_font("Helvetica", "", 9)
        pdf.cell(val_w, height, str(value), border=1, fill=True)

    draw_table_cell("Check-in", check_in_str, 25, 60, 7)
    draw_table_cell("Check-out", check_out_str, 25, 60, 7)
    pdf.ln(7)
    
    stay_text = f"{nights} Night" if nights == 1 else f"{nights} Nights"
    guests_text = f"{guests} Guest" if guests == 1 else f"{guests} Guests"
    draw_table_cell("Stay", stay_text, 25, 60, 7)
    draw_table_cell("Guests", guests_text, 25, 60, 7)
    pdf.ln(7)

    total_rooms = 0
    all_rooms = [
        ("triple", "Triple Occupancy"),
        ("double", "Double Occupancy"),
        ("quad", "Quad Occupancy (4 Occupancy)")
    ]
    for key, label in all_rooms:
        if included_rooms.get(key, True):
            total_rooms += rooms.get(key, {}).get("quantity", 0)
    
    rooms_text = f"{total_rooms} Room" if total_rooms == 1 else f"{total_rooms} Rooms"

    draw_table_cell("Rooms", rooms_text, 25, 60, 7)
    draw_table_cell("Guest Status", guest_status, 25, 60, 7)
    pdf.ln(10)

    if guest_status == "Returning / Old Guest":
        pdf.set_fill_color(255, 249, 230)
        pdf.set_draw_color(255, 230, 153)
        pdf.set_text_color(133, 100, 4)
        
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(0, 6, "Special Returning Guest Discount", border="TLR", fill=True, align="C")
        pdf.ln(6)
        pdf.set_font("Helvetica", "", 9)
        pdf.cell(0, 6, "As a valued old guest, an additional discounted rate has already been provided in this quotation.", border="BLR", fill=True, align="C")
        pdf.ln(10)

    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(21, 115, 102)
    pdf.cell(0, 6, "Room Arrangement", ln=True)
    pdf.ln(2)

    pdf.set_fill_color(21, 115, 102)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_draw_color(221, 221, 221)
    
    pdf.cell(50, 8, "Room Type", border=1, fill=True)
    pdf.cell(25, 8, "Quantity", border=1, fill=True, align="C")
    pdf.cell(50, 8, "Inclusion", border=1, fill=True)
    pdf.cell(25, 8, "Rate / Night", border=1, fill=True, align="R")
    pdf.cell(20, 8, "Total", border=1, fill=True, align="R")
    pdf.ln(8)

    pdf.set_text_color(34, 34, 34)
    room_only_total = 0

    for key, label in all_rooms:
        if included_rooms.get(key, True):
            room_data = rooms.get(key, {})
            qty = room_data.get("quantity", 0)
            rate = room_data.get("rate", 0)
            inc = room_data.get("inclusion", "")
            total = qty * rate * nights
            room_only_total += total
            
            pdf.set_font("Helvetica", "B", 9)
            pdf.cell(50, 7, label, border=1)
            pdf.set_font("Helvetica", "", 9)
            qty_text = f"{qty} Room" if qty == 1 else f"{qty} Rooms"
            pdf.cell(25, 7, qty_text, border=1, align="C")
            pdf.cell(50, 7, inc, border=1)
            pdf.cell(25, 7, format_currency(rate), border=1, align="R")
            pdf.cell(20, 7, format_currency(total), border=1, align="R")
            pdf.ln(7)

    pdf.set_fill_color(241, 245, 249)
    pdf.set_font("Helvetica", "B", 9)
    pdf.cell(125, 7, "", border=1, fill=True)
    pdf.cell(25, 7, "Room Only Total", border=1, fill=True, align="R")
    pdf.cell(20, 7, format_currency(room_only_total), border=1, fill=True, align="R")
    pdf.ln(10)

    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(21, 115, 102)
    pdf.cell(0, 6, "Available Package Options", ln=True)
    pdf.ln(2)

    pdf.set_fill_color(21, 115, 102)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Helvetica", "B", 9)
    pdf.cell(25, 8, "Plan", border=1, fill=True)
    pdf.cell(45, 8, "Includes", border=1, fill=True)
    pdf.cell(25, 8, "Meal Rate", border=1, fill=True, align="C")
    pdf.cell(50, 8, "Calculation", border=1, fill=True)
    pdf.cell(25, 8, "Grand Total", border=1, fill=True, align="R")
    pdf.ln(8)

    pdf.set_text_color(34, 34, 34)

    all_packages = [
        ("room_only", "Room Only", "Stay only", "-", room_only_total),
        ("cp", "CP", "Room + Breakfast", meal_rates.get("cp", 0), room_only_total + (guests * meal_rates.get("cp", 0) * nights)),
        ("map", "MAP", "Room + Breakfast + Dinner", meal_rates.get("map", 0), room_only_total + (guests * meal_rates.get("map", 0) * nights)),
        ("ap", "AP", "Room + Breakfast + Lunch + Dinner", meal_rates.get("ap", 0), room_only_total + (guests * meal_rates.get("ap", 0) * nights)),
        ("ap_hi_tea", "AP + Hi Tea", "Room + Breakfast + Lunch + Hi Tea + Dinner", meal_rates.get("ap_hi_tea", 0), room_only_total + (guests * meal_rates.get("ap_hi_tea", 0) * nights))
    ]

    for key, plan, includes, rate, total in all_packages:
        if included_packages.get(key, True):
            meal_rate_str = "-" if rate == "-" else f"Rs. {rate}/person"
            if plan == "Room Only":
                calc_str = "Room total"
            else:
                formatted_room_total = f"Rs.{room_only_total:,}"
                formatted_rate = f"Rs.{rate:,}"
                if nights == 1:
                    calc_str = f"{formatted_room_total} + {guests} x {formatted_rate}"
                else:
                    calc_str = f"{formatted_room_total} + {guests} x {nights} x {formatted_rate}"
            
            pdf.set_font("Helvetica", "B", 9) if plan == "Room Only" else pdf.set_font("Helvetica", "", 9)
            pdf.cell(25, 7, plan, border=1)
            pdf.cell(45, 7, includes, border=1)
            pdf.cell(25, 7, meal_rate_str, border=1, align="C")
            pdf.cell(50, 7, calc_str, border=1)
            pdf.set_font("Helvetica", "B", 9)
            pdf.cell(25, 7, format_currency(total), border=1, align="R")
            pdf.ln(7)

    pdf.add_page()

    if os.path.exists(logo_path):
        pdf.image(logo_path, x=82.5, y=15, w=45)
        pdf.set_y(40)
    else:
        pdf.set_y(15)
        pdf.set_font("Helvetica", "B", 16)
        pdf.cell(0, 10, resort_info.get("name", "Resort"), ln=True, align="C")
        pdf.set_font("Helvetica", "", 10)
        pdf.cell(0, 5, resort_info.get("subtitle", ""), ln=True, align="C")
        pdf.ln(5)

    pdf.set_font("Helvetica", "B", 13)
    pdf.set_text_color(21, 115, 102)
    pdf.cell(0, 8, "Meal Details", ln=True, align="C")
    pdf.set_font("Helvetica", "I", 9)
    pdf.set_text_color(102, 102, 102)
    pdf.cell(0, 5, "Meals will be served according to the selected CP, MAP, AP or AP + Hi Tea package.", ln=True, align="C")
    pdf.ln(8)

    meal_configs = [
        ("breakfast", "Breakfast"),
        ("lunch", "Lunch"),
        ("hi_tea", "Hi Tea"),
        ("dinner", "Dinner")
    ]
    
    active_meals = []
    for key, label in meal_configs:
        if included_meals.get(key, True):
            active_meals.append({
                "label": label,
                "items": menus.get(key, [])
            })
            
    num_active_meals = len(active_meals)
    if num_active_meals > 0:
        col_width = 170 / num_active_meals
        start_y = pdf.get_y()
        max_height = 0
        
        for meal in active_meals:
            h = len(meal["items"]) * 5 + 10
            if h > max_height:
                max_height = h
                
        for idx, meal in enumerate(active_meals):
            x = 20 + idx * col_width
            
            pdf.set_xy(x, start_y)
            pdf.set_fill_color(21, 115, 102)
            pdf.set_text_color(255, 255, 255)
            pdf.set_font("Helvetica", "B", 9)
            pdf.cell(col_width, 8, meal["label"], border=1, fill=True, align="C")
            
            pdf.set_draw_color(21, 115, 102)
            pdf.rect(x, start_y + 8, col_width, max_height - 8)
            
            pdf.set_text_color(34, 34, 34)
            pdf.set_font("Helvetica", "", 8.5)
            items_y = start_y + 11
            for item in meal["items"]:
                pdf.set_xy(x + 2, items_y)
                pdf.cell(col_width - 4, 4.5, f"- {item}", border=0)
                items_y += 4.5
                
        pdf.set_xy(20, start_y + max_height + 8)

    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(21, 115, 102)
    pdf.cell(0, 6, "Important Notes", ln=True)
    pdf.ln(2)

    pdf.set_fill_color(238, 246, 246)
    pdf.set_draw_color(210, 230, 227)
    pdf.set_text_color(34, 34, 34)
    
    hi_tea_diff = meal_rates.get("ap_hi_tea", 1250) - meal_rates.get("ap", 950)
    notes_start_y = pdf.get_y()
    
    pdf.set_font("Helvetica", "", 9)
    bullet_lines = []
    for note in important_notes:
        formatted_note = note
        if "Hi Tea rate is" in formatted_note:
            formatted_note = f"Hi Tea rate is Rs. {hi_tea_diff} per person, included in the AP + Hi Tea package total."
        bullet_lines.append(f"- {formatted_note}")
        
    pdf.set_xy(20, notes_start_y)
    pdf.cell(170, 4, "", border="TLR", fill=True, ln=True)
    
    for line in bullet_lines:
        pdf.set_x(25)
        pdf.multi_cell(160, 4.5, line, border=0, fill=True)
        curr_y = pdf.get_y()
        pdf.set_draw_color(210, 230, 227)
        pdf.line(20, curr_y - 4.5, 20, curr_y)
        pdf.line(190, curr_y - 4.5, 190, curr_y)
        
    pdf.set_x(20)
    pdf.cell(170, 4, "", border="BLR", fill=True, ln=True)
    pdf.ln(8)

    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(21, 115, 102)
    pdf.cell(0, 6, "We look forward to welcoming you again to Meera Valley Resort.", ln=True, align="C")
    pdf.set_font("Helvetica", "B", 13)
    pdf.cell(0, 8, "Thank You", ln=True, align="C")

    return pdf.output()

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
    return response

@app.route('/api/generate-pdf', methods=['POST', 'OPTIONS'])
def generate_pdf():
    if request.method == 'OPTIONS':
        return '', 200
        
    if request.is_json:
        data = request.json
    else:
        data_str = request.form.get("data")
        if data_str:
            try:
                data = json.loads(data_str)
            except Exception:
                data = None
        else:
            data = None
            
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    try:
        pdf_bytes = build_pdf(data)
        resort_name = data.get("resort_info", {}).get("name", "Quotation").replace(" ", "_")
        filename = f"Quotation_{resort_name}.pdf"
        
        return send_file(
            io.BytesIO(pdf_bytes),
            mimetype="application/pdf",
            as_attachment=True,
            download_name=filename
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to generate PDF: {str(e)}"}), 500

if __name__ == '__main__':
    # Creating templates and static directories if they don't exist
    os.makedirs(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates'), exist_ok=True)
    os.makedirs(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'css'), exist_ok=True)
    os.makedirs(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'js'), exist_ok=True)
    
    app.run(host='127.0.0.1', port=5000, debug=True)

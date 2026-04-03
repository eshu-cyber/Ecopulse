from flask import Flask, jsonify, request
from flask_cors import CORS
from model import predict

app = Flask(__name__)
CORS(app)

months = ["Jan","Feb","Mar","Apr","May","Jun",
          "Jul","Aug","Sep","Oct","Nov","Dec"]

pollution = [155,148,140,130,125,135,140,145,150,155,165,170]

hospitals = {
    "NTR Hospital": 120,
    "Govt Hospital": 100,
    "Queens NRI": 140,
    "SevenHills": 160,
    "CARE Hospitals": 180,
    "Medirise Hospital": 130,
    "Pavan Sai Hospital": 90,
    "Sri Vishnu Hospital": 150,
    "Rise Hospital": 110,
    "Pranamya Hospital": 125
}

@app.route('/data')
def get_data():
    all_data = {}
    for h_name, h_val in hospitals.items():
        all_data[h_name] = {}
        factor = h_val / 120
        # Compile all available years dynamically at boot so browser never has to wait
        for y in [2024, 2025, 2026, 2027]:
            all_data[h_name][y] = {}
            for m_idx, m_name in enumerate(months):
                all_data[h_name][y][m_name] = predict(m_idx, y, factor)["daily_data"]
                
    return jsonify({
        "months": months,
        "pollution": pollution,
        "hospitals": hospitals,
        "predictions": all_data
    })

@app.route('/predict')
def get_prediction():
    month = request.args.get("month")
    year = int(request.args.get("year"))
    hospital = request.args.get("hospital")

    if not month or not hospital:
        return jsonify({"error": "Missing data"}), 400

    month_index = months.index(month)
    factor = hospitals[hospital] / 120

    result = predict(month_index, year, factor)

    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)  
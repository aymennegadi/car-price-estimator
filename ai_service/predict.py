from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import json
import os

app = Flask(__name__)
CORS(app)

# Chargement du modele
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = joblib.load(os.path.join(BASE_DIR, "car_price_model.pkl"))

with open(os.path.join(BASE_DIR, "encoders_classes.json"), "r", encoding="utf-8") as f:
    encoder_classes = json.load(f)

with open(os.path.join(BASE_DIR, "model_metrics.json"), "r") as f:
    metrics = json.load(f)

FEATURES = metrics["features"]

def encode_value(col, value):
    classes = encoder_classes.get(col, [])
    if value in classes:
        return classes.index(value)
    return -1

def build_features(data):
    age = 2024 - data["annee"]
    km_par_an = data["km"] / max(age, 1)

    row = {
        "marque_enc":    encode_value("marque",    data.get("marque", "")),
        "modele_enc":    encode_value("modele",    data.get("modele", "")),
        "annee":         data["annee"],
        "age":           age,
        "km":            data["km"],
        "km_par_an":     km_par_an,
        "carburant_enc": encode_value("carburant", data.get("carburant", "Essence")),
        "boite_enc":     encode_value("boite",     data.get("boite", "Manuelle")),
        "puissance":     data.get("puissance", 90),
        "wilaya_enc":    encode_value("wilaya",    data.get("wilaya", "Alger")),
    }
    return [row[f] for f in FEATURES]

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model_r2": metrics["r2"]})

@app.route("/options", methods=["GET"])
def options():
    return jsonify(encoder_classes)

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Corps JSON manquant"}), 400

    required = ["annee", "km"]
    missing = [f for f in required if f not in data]
    if missing:
        return jsonify({"error": f"Champs manquants : {missing}"}), 400

    try:
        row = build_features(data)
        prix = float(model.predict([row])[0])

        marge = metrics["mae"] * 1.2
        prix_min = max(int(round((prix - marge) / 50_000) * 50_000), 100_000)
        prix_max = int(round((prix + marge) / 50_000) * 50_000)
        prix_est = int(round(prix / 50_000) * 50_000)

        return jsonify({
            "prix":      prix_est,
            "prix_min":  prix_min,
            "prix_max":  prix_max,
            "devise":    "DA",
            "confiance": round(metrics["r2"] * 100, 1)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("API demarree sur http://localhost:5000")
    app.run(debug=True, port=5000)
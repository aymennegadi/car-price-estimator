import pandas as pd
import numpy as np
import joblib
import json
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, r2_score, mean_absolute_percentage_error

# 1. Chargement
df = pd.read_csv("dataset.csv")
print(f"Dataset : {df.shape[0]} lignes, {df.shape[1]} colonnes")

# 2. Feature Engineering
df["age"] = 2024 - df["annee"]
df["km_par_an"] = df["km"] / df["age"].replace(0, 1)

# 3. Encodage
cat_cols = ["marque", "modele", "carburant", "boite", "wilaya"]
encoders = {}

for col in cat_cols:
    le = LabelEncoder()
    df[col + "_enc"] = le.fit_transform(df[col])
    encoders[col] = le

# 4. Features & Target
features = [
    "marque_enc", "modele_enc", "annee", "age", "km",
    "km_par_an", "carburant_enc", "boite_enc", "puissance", "wilaya_enc"
]
X = df[features]
y = df["prix"]

# 5. Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 6. Entrainement
print("Entrainement en cours...")
rf = RandomForestRegressor(
    n_estimators=200,
    max_depth=20,
    min_samples_split=4,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)
rf.fit(X_train, y_train)

# 7. Evaluation
y_pred = rf.predict(X_test)
mae   = mean_absolute_error(y_test, y_pred)
mape  = mean_absolute_percentage_error(y_test, y_pred) * 100
r2    = r2_score(y_test, y_pred)

print(f"MAE  : {mae:,.0f} DA")
print(f"MAPE : {mape:.1f}%")
print(f"R2   : {r2:.4f}")

# 8. Sauvegarde
joblib.dump(rf, "car_price_model.pkl")

encoder_data = {}
for col, le in encoders.items():
    encoder_data[col] = list(le.classes_)

with open("encoders_classes.json", "w", encoding="utf-8") as f:
    json.dump(encoder_data, f, ensure_ascii=False, indent=2)

metrics = {
    "mae": round(mae),
    "mape": round(mape, 2),
    "r2": round(r2, 4),
    "features": features
}
with open("model_metrics.json", "w") as f:
    json.dump(metrics, f, indent=2)

print("Modele sauvegarde !")
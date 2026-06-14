import pandas as pd
import numpy as np

np.random.seed(42)

marques_modeles = {
    "Renault": ["Clio", "Symbol", "Logan", "Megane", "Duster"],
    "Peugeot": ["206", "207", "208", "301", "308", "Partner"],
    "Volkswagen": ["Golf", "Polo", "Passat", "Tiguan"],
    "Toyota": ["Yaris", "Corolla", "Hilux", "Land Cruiser"],
    "Hyundai": ["i10", "i20", "Elantra", "Tucson"],
    "Kia": ["Picanto", "Rio", "Sportage", "Cerato"],
    "Dacia": ["Sandero", "Logan", "Duster", "Dokker"],
    "Chevrolet": ["Aveo", "Optra", "Captiva", "Spark"],
    "Seat": ["Ibiza", "Leon", "Arona"],
    "Fiat": ["Punto", "Palio", "500", "Tipo"],
}

carburants = ["Essence", "Diesel", "GPL"]
boites = ["Manuelle", "Automatique"]
wilayas = ["Alger", "Oran", "Constantine", "Annaba", "Blida", "Setif", "Tlemcen", "Bejaia"]

def prix_base(marque, modele, annee, km, carburant, boite, puissance):
    base_marque = {
        "Toyota": 2_800_000, "Volkswagen": 2_600_000, "Hyundai": 2_200_000,
        "Kia": 2_100_000, "Renault": 1_900_000, "Peugeot": 1_850_000,
        "Dacia": 1_700_000, "Seat": 1_750_000, "Chevrolet": 1_600_000, "Fiat": 1_500_000,
    }
    prix = base_marque.get(marque, 1_800_000)

    modeles_premium = ["Land Cruiser", "Hilux", "Tiguan", "Tucson", "Sportage", "Duster", "Captiva", "Arona"]
    if modele in modeles_premium:
        prix *= 1.35

    age = 2024 - annee
    if age <= 1:
        depreciation = 0.0
    elif age <= 3:
        depreciation = 0.12 * age
    elif age <= 7:
        depreciation = 0.10 * age
    else:
        depreciation = 0.08 * age
    prix *= (1 - min(depreciation, 0.70))

    km_factor = 1.0 - (km / 400_000) * 0.35
    prix *= max(km_factor, 0.50)

    if carburant == "Diesel":
        prix *= 1.08
    elif carburant == "GPL":
        prix *= 0.90

    if boite == "Automatique":
        prix *= 1.12

    prix += (puissance - 70) * 8_000

    return max(int(prix), 250_000)

rows = []
n = 1200

for _ in range(n):
    marque = np.random.choice(list(marques_modeles.keys()))
    modele = np.random.choice(marques_modeles[marque])
    annee = int(np.random.randint(2005, 2024))
    km = int(np.random.randint(5_000, 350_000))
    carburant = np.random.choice(carburants, p=[0.55, 0.38, 0.07])
    boite = np.random.choice(boites, p=[0.78, 0.22])
    puissance = int(np.random.randint(55, 180))
    wilaya = np.random.choice(wilayas)

    prix = prix_base(marque, modele, annee, km, carburant, boite, puissance)
    bruit = np.random.uniform(0.90, 1.10)
    prix = int(prix * bruit)
    prix = round(prix / 50_000) * 50_000

    rows.append({
        "marque": marque, "modele": modele, "annee": annee,
        "km": km, "carburant": carburant, "boite": boite,
        "puissance": puissance, "wilaya": wilaya, "prix": prix
    })

df = pd.DataFrame(rows)
df.to_csv("dataset.csv", index=False)
print(f"Dataset créé : {len(df)} lignes")
print(df.sample(5).to_string())
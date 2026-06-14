import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import random

BASE_URL = "https://www.ouedkniss.com"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def get_page(url):
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        if response.status_code == 200:
            return BeautifulSoup(response.text, "lxml")
        return None
    except Exception as e:
        print(f"Erreur : {e}")
        return None

def scrape_voitures(pages=5):
    annonces = []
    
    for page in range(1, pages + 1):
        print(f"Page {page}/{pages}...")
        url = f"{BASE_URL}/auto-vehicule-utilitaire-voiture-particuliere/annonces?page={page}"
        soup = get_page(url)
        
        if not soup:
            continue

        cards = soup.find_all("div", class_="announcement-item")
        
        if not cards:
            cards = soup.find_all("div", attrs={"class": lambda x: x and "card" in x.lower()})

        print(f"  {len(cards)} annonces trouvées")

        for card in cards:
            try:
                titre = card.find("h2") or card.find("h3") or card.find("a")
                prix_el = card.find(attrs={"class": lambda x: x and "price" in str(x).lower()})
                
                titre_text = titre.get_text(strip=True) if titre else ""
                prix_text = prix_el.get_text(strip=True) if prix_el else ""

                if titre_text and prix_text:
                    annonces.append({
                        "titre": titre_text,
                        "prix_brut": prix_text,
                    })
            except:
                continue

        time.sleep(random.uniform(1.5, 3.0))

    return annonces

def nettoyer_prix(prix_str):
    try:
        prix = prix_str.replace(" ", "").replace("DA", "").replace(",", "").strip()
        return int(prix)
    except:
        return None

if __name__ == "__main__":
    print("🕷️ Scraping Ouedkniss...")
    annonces = scrape_voitures(pages=5)
    
    if annonces:
        df = pd.DataFrame(annonces)
        df["prix"] = df["prix_brut"].apply(nettoyer_prix)
        df = df.dropna(subset=["prix"])
        df.to_csv("dataset_reel.csv", index=False)
        print(f"\n✅ {len(df)} annonces sauvegardées dans dataset_reel.csv")
        print(df.head(10).to_string())
    else:
        print("❌ Aucune annonce trouvée")
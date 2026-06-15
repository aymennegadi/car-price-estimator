#  EstiAuto DZ — AI Car Price Estimator for Algeria

An intelligent web application that estimates used car prices in Algeria using a Machine Learning model (Random Forest, R² = 90%).

---

##  Tech Stack

- **Frontend** → React.js + Tailwind CSS
- **Backend** → Node.js / Express
- **AI Model** → Python + Scikit-Learn
- **Database** → PostgreSQL + Prisma

---

##  Installation & Setup

### 1. Clone the project
```bash
git clone https://github.com/aymennegadi/car-price-estimator.git
cd car-price-estimator
```

### 2. AI Model (Python)
```bash
cd ai-service
pip install pandas scikit-learn joblib flask flask-cors numpy
python generate_dataset.py
python train.py
```

### 3. Backend (Node.js)
```bash
cd ../backend
npm install
npm serveur.js
```
Create a `.env` file in `/backend` :
```
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/estiautodz"
```
```bash
npx prisma migrate dev --name init
node createAdmin.js
node server.js
```

### 4. Frontend (React)
```bash
cd ../frontend
npm install
npm start
```


## admin login
just add /admin
email : admin@estiauto.com  
password : admin1234

## Note on Pricing Data

Car prices in this application are based on the Algerian market.
The Renault Clio pricing has been updated to reflect real market values.
Other brands are still using estimated base prices and will be updated progressively as market research is completed.

import React, { useState } from "react";
import axios from "axios";


const wilayas = [
  "Alger", "Oran", "Constantine", "Annaba", "Blida", "Setif",
  "Tlemcen", "Bejaia", "Batna", "Biskra", "Tizi Ouzou", "Sidi Bel Abbes",
  "Skikda", "Jijel", "Mostaganem", "Mascara", "Chlef", "Tiaret",
  "Bordj Bou Arreridj", "Boumerdes"
];

const marques = [
  "Renault", "Peugeot", "Volkswagen", "Toyota", "Hyundai",
  "Kia", "Dacia", "Chevrolet", "Seat", "Fiat"
];

const modeles = {
  Renault: ["Clio", "Symbol", "Logan", "Megane", "Duster"],
  Peugeot: ["206", "207", "208", "301", "308", "Partner"],
  Volkswagen: ["Golf", "Polo", "Passat", "Tiguan"],
  Toyota: ["Yaris", "Corolla", "Hilux", "Land Cruiser"],
  Hyundai: ["i10", "i20", "Elantra", "Tucson"],
  Kia: ["Picanto", "Rio", "Sportage", "Cerato"],
  Dacia: ["Sandero", "Logan", "Duster", "Dokker"],
  Chevrolet: ["Aveo", "Optra", "Captiva", "Spark"],
  Seat: ["Ibiza", "Leon", "Arona"],
  Fiat: ["Punto", "Palio", "500", "Tipo"],
};

export default function Home() {
  const [step, setStep] = useState(1);
  const [user, setUser] = useState({ nom: "", prenom: "", email: "" });
  const [form, setForm] = useState({
    marque: "", modele: "", annee: "", km: "",
    carburant: "Essence", boite: "Manuelle", puissance: "", wilaya: "Alger"
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUser = (e) => setUser({ ...user, [e.target.name]: e.target.value });
  const handleForm = (e) => {
    if (e.target.name === "marque") {
      setForm(f => ({ ...f, modele: "", marque: e.target.value }));
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  
  const [commentaire, setCommentaire] = useState("");
  const [estimationId, setEstimationId] = useState(null);
  const [commentSent, setCommentSent] = useState(false);


  const submitUser = (e) => {
    e.preventDefault();
    if (!user.nom || !user.prenom || !user.email) return setError("Please fill in all fields");
    setError("");
    setStep(2);
  };

  const submitEstimation = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("http://localhost:3001/estimate", {
        ...form,
        annee: parseInt(form.annee),
        km: parseInt(form.km),
        puissance: parseInt(form.puissance),
        user,
      });
      setResult(res.data);
      setEstimationId(res.data.estimationId);
      setStep(3);
    } catch (err) {
      setError("Estimation error. Make sure the servers are running.");
    }
    setLoading(false);
  };

  const reset = () => {
    setStep(1);
    setResult(null);
    setForm({ marque: "", modele: "", annee: "", km: "", carburant: "Essence", boite: "Manuelle", puissance: "", wilaya: "Alger" });
    setUser({ nom: "", prenom: "", email: "" });
  };

  const submitCommentaire = async () => {
  if (!commentaire) return;
  try {
    await axios.patch(`http://localhost:3001/estimation/${estimationId}/comment`, {
      commentaire,
    });
    setCommentSent(true);
  } catch (err) {
    console.error(err);
  }
};
const handlePrint = () => {
  const printContent = `
    <html>
      <head>
        <title>EstiAuto DZ - Estimation Result</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          h1 { color: #1d4ed8; }
          .section { margin-bottom: 20px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; }
          .section h2 { font-size: 14px; color: #6b7280; margin-bottom: 10px; text-transform: uppercase; }
          .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
          .price { font-size: 32px; font-weight: bold; color: #1d4ed8; }
          .range { font-size: 16px; color: #374151; margin-top: 8px; }
          .confidence { color: #16a34a; font-size: 13px; margin-top: 6px; }
          .footer { margin-top: 40px; text-align: center; color: #9ca3af; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>🚗 EstiAuto DZ — Estimation Result</h1>
        
        <div class="section">
          <h2>User Information</h2>
          <div class="row"><span>Last Name</span><span>${user.nom}</span></div>
          <div class="row"><span>First Name</span><span>${user.prenom}</span></div>
          <div class="row"><span>Email</span><span>${user.email}</span></div>
        </div>

        <div class="section">
          <h2>Vehicle Details</h2>
          <div class="row"><span>Brand</span><span>${form.marque}</span></div>
          <div class="row"><span>Model</span><span>${form.modele}</span></div>
          <div class="row"><span>Year</span><span>${form.annee}</span></div>
          <div class="row"><span>Mileage</span><span>${parseInt(form.km).toLocaleString()} km</span></div>
          <div class="row"><span>Fuel Type</span><span>${form.carburant}</span></div>
          <div class="row"><span>Gearbox</span><span>${form.boite}</span></div>
          <div class="row"><span>Horsepower</span><span>${form.puissance} HP</span></div>
          <div class="row"><span>Wilaya</span><span>${form.wilaya}</span></div>
        </div>

        <div class="section">
          <h2>AI Estimation</h2>
          <div class="price">${result.prix.toLocaleString()} DA</div>
          <div class="range">Price Range: ${result.prix_min.toLocaleString()} DA — ${result.prix_max.toLocaleString()} DA</div>
          <div class="confidence">AI Confidence: ${result.confiance}%</div>
        </div>

        <div class="footer">
          Generated by EstiAuto DZ — Developed by Aymen Negadi — ${new Date().toLocaleDateString()}
        </div>
      </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.print();
};

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-4xl flex overflow-hidden">

          {/* Left column — description */}
          <div className="hidden md:flex flex-col justify-center w-5/12 p-10 bg-blue-700 text-white">
<h1>EstiAuto DZ — Estimation Result</h1>
  <p className="text-blue-300 text-sm mb-6 font-medium uppercase tracking-wide">
    AI-Powered Car Price Estimator
  </p>
  <p className="leading-relaxed text-blue-100 mb-4">
    EstiAuto DZ uses a machine learning model trained on 
    thousands of car listings from the Algerian market. 
    The AI continuously learns patterns in price, brand, 
    mileage, and year to deliver accurate and reliable estimates.
    This project was built to help Algerian buyers and sellers make smarter decisions
  </p>
 
  <p className="leading-relaxed text-blue-100 mb-8">
    Simply fill in your vehicle details and receive an instant 
    AI-generated price estimate
  </p>
  
</div>

          {/* Right column — form */}
          <div className="w-full md:w-7/12 p-8">

            {/* Mobile header */}
            <div className="text-center mb-6 md:hidden">
              <h1 className="text-2xl font-bold text-blue-700">🚗 EstiAuto DZ</h1>
              <p className="text-gray-500 text-sm mt-1">Car Price Estimator in Algeria</p>
            </div>

            {/* Step 1 */}
            {step === 1 && (
              <form onSubmit={submitUser} className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-700">Your Information</h2>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <input name="nom" placeholder="Last Name" value={user.nom} onChange={handleUser}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                <input name="prenom" placeholder="First Name" value={user.prenom} onChange={handleUser}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                <input name="email" type="email" placeholder="Email" value={user.email} onChange={handleUser}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                <button type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                  Continue →
                </button>
              </form>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <form onSubmit={submitEstimation} className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-700">Vehicle Information</h2>
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <select name="marque" value={form.marque} onChange={handleForm}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="">-- Brand --</option>
                  {marques.map(m => <option key={m}>{m}</option>)}
                </select>

                <select name="modele" value={form.modele} onChange={handleForm}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="">-- Model --</option>
                  {(modeles[form.marque] || []).map(m => <option key={m}>{m}</option>)}
                </select>

                <input name="annee" type="number" placeholder="Year (e.g. 2018)" value={form.annee} onChange={handleForm}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400" />

                <input name="km" type="number" placeholder="Mileage (e.g. 85000)" value={form.km} onChange={handleForm}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400" />

                <select name="carburant" value={form.carburant} onChange={handleForm}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="Essence">Gasoline</option>
                  <option value="Diesel">Diesel</option>
                  <option value="GPL">LPG</option>
                </select>

                <select name="boite" value={form.boite} onChange={handleForm}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="Manuelle">Manual</option>
                  <option value="Automatique">Automatic</option>
                </select>

                <input name="puissance" type="number" placeholder="Horsepower (e.g. 90)" value={form.puissance} onChange={handleForm}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400" />

                <select name="wilaya" value={form.wilaya} onChange={handleForm}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400">
                  {wilayas.map(w => <option key={w}>{w}</option>)}
                </select>

                <button type="submit" disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                  {loading ? "Estimating..." : "Estimate Price 🔍"}
                </button>
              </form>
            )}

            {/* Step 3 */}
{step === 3 && result && (
  <div className="text-center space-y-6">
    <h2 className="text-lg font-semibold text-gray-700">Estimation Result</h2>
    <div className="bg-blue-50 rounded-xl p-6">
      <p className="text-gray-500 text-sm">Estimated Price</p>
      <p className="text-4xl font-bold text-blue-700 mt-1">
        {result.prix.toLocaleString()} DA
      </p>
      <p className="text-gray-500 text-sm mt-3">Price Range</p>
      <p className="text-lg font-medium text-gray-700">
        {result.prix_min.toLocaleString()} DA — {result.prix_max.toLocaleString()} DA
      </p>
      <p className="text-sm text-green-600 mt-2">Confidence: {result.confiance}%</p>
    </div>
    <button onClick={handlePrint}
      className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition">
        🖨️ Print Result
    </button>

    {/* Commentaire */}
    <div className="text-left space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Leave a comment (optional)
      </label>
      <textarea
        placeholder="e.g. The seller is asking 1,400,000 DA — is that reasonable?"
        value={commentaire}
        onChange={(e) => setCommentaire(e.target.value)}
        className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
        rows={3}
      />
      <button
        onClick={submitCommentaire}
        className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
        Submit Comment
      </button>
      {commentSent && (
        <p className="text-green-500 text-sm text-center">✅ Comment saved!</p>
      )}
    </div>

    <button onClick={reset}
      className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition">
      New Estimation
    </button>
  </div>
)}

          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-sm text-gray-400">
        Developed by{" "}
        <span className="font-semibold text-blue-600">Aymen Negadi</span>
      </div>

    </div>
  );
}
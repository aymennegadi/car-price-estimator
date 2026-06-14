const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();
const PORT = 3001;
const PYTHON_API = "http://localhost:5000";

app.use(cors());
app.use(express.json());

// Test
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Options
app.get("/options", async (req, res) => {
  try {
    const response = await axios.get(`${PYTHON_API}/options`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Python API unavailable" });
  }
});

// Estimation
app.post("/estimate", async (req, res) => {
  try {
    const { user, ...carData } = req.body;

    // Appel API Python
    const response = await axios.post(`${PYTHON_API}/predict`, carData);
    const result = response.data;

    // Sauvegarder user et estimation
    const savedUser = await prisma.user.create({
      data: {
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        estimations: {
          create: {
            marque: carData.marque,
            modele: carData.modele,
            annee: carData.annee,
            km: carData.km,
            carburant: carData.carburant,
            boite: carData.boite,
            puissance: carData.puissance,
            wilaya: carData.wilaya,
            prix: result.prix,
            prixMin: result.prix_min,
            prixMax: result.prix_max,
            confiance: result.confiance,
          }
        }
      },
      include: { estimations: true }
    });

    res.json({
      ...result,
      estimationId: savedUser.estimations[0].id,
      userId: savedUser.id,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Estimation error" });
  }
});

// Ajouter commentaire
app.patch("/estimation/:id/comment", async (req, res) => {
  try {
    const { commentaire } = req.body;
    const estimation = await prisma.estimation.update({
      where: { id: parseInt(req.params.id) },
      data: { commentaire },
    });
    res.json(estimation);
  } catch (error) {
    res.status(500).json({ error: "Comment error" });
  }
});

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "estiautodz_secret_2024";

// Middleware auth admin
const authAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Login admin
app.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) return res.status(401).json({ error: "Invalid credentials" });
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ adminId: admin.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Login error" });
  }
});

// Dashboard stats
app.get("/admin/stats", authAdmin, async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalEstimations = await prisma.estimation.count();
    const recentEstimations = await prisma.estimation.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });
    const marques = await prisma.estimation.groupBy({
      by: ["marque"],
      _count: { marque: true },
      orderBy: { _count: { marque: "desc" } },
      take: 5,
    });
    const wilayas = await prisma.estimation.groupBy({
      by: ["wilaya"],
      _count: { wilaya: true },
      orderBy: { _count: { wilaya: "desc" } },
      take: 5,
    });
    res.json({ totalUsers, totalEstimations, recentEstimations, marques, wilayas });
  } catch (error) {
    res.status(500).json({ error: "Stats error" });
  }
});

// Tous les utilisateurs
app.get("/admin/users", authAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { estimations: true },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Users error" });
  }
});

// Toutes les estimations
app.get("/admin/estimations", authAdmin, async (req, res) => {
  try {
    const estimations = await prisma.estimation.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });
    res.json(estimations);
  } catch (error) {
    res.status(500).json({ error: "Estimations error" });
  }
});

// Changer mot de passe admin
app.patch("/admin/password", authAdmin, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await prisma.admin.findUnique({ where: { id: decoded.adminId } });
    const valid = await bcrypt.compare(oldPassword, admin.password);
    if (!valid) return res.status(401).json({ error: "Wrong password" });
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.admin.update({ where: { id: admin.id }, data: { password: hashed } });
    res.json({ message: "Password updated" });
  } catch (error) {
    res.status(500).json({ error: "Password error" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
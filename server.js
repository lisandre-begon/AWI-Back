const express = require('express');
const { connectDB } = require('./config/database');
const { exec } = require('child_process');

const app = express();
const defaultPort = 3000;
const fallbackPort = 5000;

// Middleware pour analyser les requêtes JSON
app.use(express.json());

// Connexion à MongoDB Atlas
connectDB().then(() => {
  console.log("Connexion réussie à MongoDB depuis le serveur !");
}).catch((err) => {
  console.error("Erreur lors de la connexion à MongoDB :", err);
  process.exit(1); // Quitte si la connexion échoue
});

// Importation des routes
const transactionRoutes = require('./routes/transactionRoutes');
const vendeurRoutes = require('./routes/vendeurRoutes');
const acheteurRoutes = require('./routes/acheteurRoutes');
const jeuRoutes = require('./routes/jeuRoutes');
const categorieRoutes = require('./routes/categorieRoutes');
const gestionnaireRoutes = require('./routes/gestionnaireRoutes');
const typeJeuRoutes = require('./routes/typeJeuRoutes');

// Définir la route de base
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Routes API
app.use('/api/transaction', transactionRoutes);
app.use('/api/vendeur', vendeurRoutes);
app.use('/api/acheteur', acheteurRoutes);
app.use('/api/jeu', jeuRoutes);
app.use('/api/categorie', categorieRoutes);
app.use('/api/gestionnaire', gestionnaireRoutes);
app.use('/api/typejeu', typeJeuRoutes);

// Lancer le serveur
exec(`lsof -i:${defaultPort}`, (err, stdout, stderr) => {
  const port = (stdout || stderr) ? fallbackPort : defaultPort;
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});

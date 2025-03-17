const express = require('express');
const cors = require('cors');
const connectToDatabase = require('./config/database');
const { exec } = require('child_process');
const cron = require('node-cron');
const SessionController = require('./controllers/sessionController');


const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

(async () => {
  try {
    await connectToDatabase();
    console.log("Connexion réussie à MongoDB depuis le serveur !");

    const transactionRoutes = require('./routes/transactionRoutes');
    const vendeurRoutes = require('./routes/vendeurRoutes');
    const acheteurRoutes = require('./routes/acheteurRoutes');
    const jeuRoutes = require('./routes/jeuRoutes');
    const categorieRoutes = require('./routes/categorieRoutes');
    const gestionnaireRoutes = require('./routes/gestionnaireRoutes');
    const typeJeuRoutes = require('./routes/typeJeuRoutes');
    const sessionRoutes = require('./routes/sessionRoutes');

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
    app.use('/api/session', sessionRoutes);

    // Start server
    exec(`lsof -i:${PORT}`, (err, stdout, stderr) => {
      const port = (stdout || stderr) ? PORT : PORT;
      app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
      });
    });

  
    // Schedule the update to run every day at midnight
    cron.schedule('0 0 * * *', () => {
        SessionController.updateSessionStatus();
        console.log('Scheduled session status update running...');
    });

  } catch (err) {
    console.error("Erreur lors de la configuration du serveur :", err);
    process.exit(1);
  }
})();

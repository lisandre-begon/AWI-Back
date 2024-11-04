const express = require('express');
const app = express();
const port = 3000;
const transactionRoutes = require('./routes/transactionRoutes');
const vendeurRoutes = require('./routes/vendeurRoutes');
const acheteurRoutes = require('./routes/acheteurRoutes');
const jeuRoutes = require('./routes/jeuRoutes');
// Middleware pour parser les requêtes JSON
app.use(express.json());

// Route de base
app.get('/', (res) => {
  res.send('Hello, world!');
});

app.use('/api/transaction', transactionRoutes);
app.use('/api/vendeur', vendeurRoutes);
app.use('/api/acheteur', acheteurRoutes);
app.use('/api/jeu', jeuRoutes);


// Démarrage du serveur
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

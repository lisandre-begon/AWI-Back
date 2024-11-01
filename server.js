const express = require('express');
const app = express();
const port = 3000;
const transactionRoutes = require('./routes/transactionRoutes');

// Middleware pour parser les requêtes JSON
app.use(express.json());

// Route de base
app.get('/', (res) => {
  res.send('Hello, world!');
});

app.use('/api', transactionRoutes);

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const { MongoClient, ServerApiVersion } = require('mongodb');

// Crédentiels et URI
const db_username = "lisandrebegon1";
const db_password = "czbssegw5de6kicv";
const db_name = "awidatabase";
const uri = `mongodb+srv://${db_username}:${db_password}@awidatabase.1z4go.mongodb.net/${db_name}?retryWrites=true&w=majority&tls=true&tlsAllowInvalidCertificates=true`;

// Initialisation des variables
let client;
let db;

// Fonction pour se connecter à MongoDB
const connectDB = async () => {
  try {
    // Créer un client MongoDB avec les options nécessaires
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });

    // Connexion au cluster
    await client.connect();
    console.log("Connexion à MongoDB réussie !");

    // Vérifier la connexion
    await client.db("admin").command({ ping: 1 });

    // Initialiser la base de données
    db = client.db(db_name);
    console.log(`Base de données sélectionnée : ${db_name}`);
  } catch (error) {
    console.error("Erreur de connexion à MongoDB :", error);
    if (client) {
      await client.close();
    }
    process.exit(1); // Arrêter le processus si la connexion échoue
  }
};

// Fonction pour obtenir la base de données
const getDB = () => {
  if (!db) {
    throw new Error("La connexion à la base de données n'est pas encore initialisée.");
  }
  return db;
};

// Exporter les fonctions pour les utiliser ailleurs
module.exports = { connectDB, getDB };

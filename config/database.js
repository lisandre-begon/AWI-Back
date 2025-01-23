// database.js
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://lisandrebegon1:czbssegw5de6kicv@awidatabase.1z4go.mongodb.net/?retryWrites=true&w=majority";
let client;
let dbInstance;

const connectToDatabase = async () => {
  if (!dbInstance) {
    try {
      client = new MongoClient(uri);
      await client.connect();
      console.log("Connexion réussie à MongoDB !");
      dbInstance = client.db("awidatabase");
    } catch (error) {
      console.error("Erreur lors de la connexion à MongoDB :", error);
      if (client) await client.close();
      throw error;
    }
  }
  return dbInstance;
};

const getDB = () => {
  if (!dbInstance) {
    throw new Error("La base de données n'est pas encore connectée.");
  }
  return dbInstance;
};

process.on('SIGINT', async () => {
  if (client) {
    await client.close();
    console.log("Connexion à MongoDB fermée.");
    process.exit(0);
  }
});

module.exports = connectToDatabase;

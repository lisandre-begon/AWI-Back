const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('nom_de_base', 'utilisateur', 'mot_de_passe', {
  host: 'localhost',
  dialect: 'postgres',
  port: 5432, // Port par défaut pour PostgreSQL
});

module.exports = sequelize;

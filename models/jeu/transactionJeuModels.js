// models/transactionModel.js
/* module.exports = (sequelize, DataTypes) => {
    const TransactionJeu = sequelize.define('Transaction', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      montant: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    }, {
      tableName: 'Transactions',
      timestamps: false,
    });
  
    TransactionJeu.associate = (models) => {
      // Relation N-N avec Jeu
      TransactionJeu.belongsToMany(models.Jeu, {
        through: 'TransactionJeu',
        foreignKey: 'transactionId',
        otherKey: 'jeuId',
      });
    };
  
    return TransactionJeu;
  };
  */
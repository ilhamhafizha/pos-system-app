'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TransactionItem extends Model {
    static associate(models) {
      // Relasi: TransactionItem milik satu TransactionGroup
      TransactionItem.belongsTo(models.TransactionGroup, {
        foreignKey: 'transaction_group_id',
        onDelete: 'CASCADE'
      });

      // Relasi: TransactionItem milik satu Catalog
      TransactionItem.belongsTo(models.Catalog, {
        foreignKey: 'catalog_id',
        onDelete: 'CASCADE'
      });
    }
  }

  TransactionItem.init({
    transaction_group_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    catalog_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    note: {
      type: DataTypes.STRING
    },
    subtotal: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'TransactionItem',
    tableName: 'TransactionItems'
  });

  return TransactionItem;
};

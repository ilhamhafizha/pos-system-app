'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TransactionGroup extends Model {
    static associate(models) {
      TransactionGroup.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });

      TransactionGroup.hasMany(models.TransactionItem, {
        foreignKey: 'transaction_group_id',
        as: 'TransactionItems' // <== tambahkan alias ini
      });

    }
  }

  TransactionGroup.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    order_number: {
      type: DataTypes.STRING,
      allowNull: false
    },
    transaction_type: {
      type: DataTypes.ENUM('dine_in', 'take_away'),
      allowNull: false
    },
    customer_name: DataTypes.STRING,
    table: DataTypes.STRING,
    subtotal_group: DataTypes.INTEGER,
    tax: DataTypes.INTEGER,
    total: DataTypes.INTEGER,
    cash: DataTypes.INTEGER,
    cashback: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'TransactionGroup',
    tableName: 'TransactionGroups'
  });

  return TransactionGroup;
};

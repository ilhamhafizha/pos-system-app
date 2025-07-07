'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Catalog extends Model {
    static associate(models) {
      Catalog.hasMany(models.TransactionItem, {
        foreignKey: 'catalog_id'
      });
    }
  }

  Catalog.init({
    image: DataTypes.STRING,
    name: DataTypes.STRING,
    category: {
      type: DataTypes.ENUM('foods', 'beverages', 'dessert'),
      allowNull: false
    },
    price: DataTypes.STRING,
    description: DataTypes.TEXT,
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    deletedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Catalog',
    paranoid: true, // enable soft delete (deletedAt)
  });

  return Catalog;
};

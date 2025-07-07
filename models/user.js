'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Definisikan asosiasi di sini
      User.hasMany(models.TransactionGroup, {
        foreignKey: 'user_id',
        as: 'transactions'
      });
    }

    validatePassword(inputPassword) {
      return bcrypt.compare(inputPassword, this.password);
    }
  }

  User.init({
    role: DataTypes.ENUM('admin', 'cashier'),
    email: DataTypes.STRING,
    name: DataTypes.STRING,
    avatar: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    status: DataTypes.STRING,
    language: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });

  User.beforeCreate(async (user, options) => {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  });

  User.beforeUpdate(async (user, options) => {
    if (user.changed('password')) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  });

  return User;
};
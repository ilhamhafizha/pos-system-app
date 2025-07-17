'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Relasi ke TransactionGroup
      User.hasMany(models.TransactionGroup, {
        foreignKey: 'user_id',
        as: 'transactions'
      });
    }

    // Validasi password saat login
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
    language: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'User',
  });

  // Hash saat membuat user baru
  User.beforeCreate(async (user, options) => {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    // fallback default
    if (user.active === undefined || user.active === null) {
      user.active = true;
    }

    // status ikut active
    user.status = user.active ? 'active' : 'inactive';
  });

  // Hash otomatis saat password diubah
  User.beforeUpdate(async (user, options) => {
    if (user.changed('password')) {
      console.log('✅ beforeUpdate triggered — password will be hashed');
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    } else {
      console.log('❌ password tidak berubah — tidak di-hash ulang');
    }
  });

  return User;
};

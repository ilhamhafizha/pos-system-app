'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [{
      role: 'admin',
      email: 'admin@kasir.com',
      name: 'Admin Kasir',
      avatar: '',
      username: 'admin',
      password: await bcrypt.hash('admin123', 10),
      status: 'active',
      language: 'en',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  }
};

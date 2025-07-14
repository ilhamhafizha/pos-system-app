'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [{
      id: 1,
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

    await queryInterface.sequelize.query(`ALTER SEQUENCE "Users_id_seq" RESTART WITH 2`);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  }
};

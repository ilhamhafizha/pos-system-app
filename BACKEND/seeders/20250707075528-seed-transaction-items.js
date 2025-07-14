'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('TransactionItems', [
      {
        transaction_group_id: 1,
        catalog_id: 1,
        quantity: 2,
        note: 'Tanpa cabe',
        subtotal: 50000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        transaction_group_id: 1,
        catalog_id: 2,
        quantity: 1,
        note: 'Es sedikit',
        subtotal: 8000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        transaction_group_id: 1,
        catalog_id: 3,
        quantity: 2,
        note: 'Topping coklat extra',
        subtotal: 30000,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('TransactionItems', null, {});
  }
};
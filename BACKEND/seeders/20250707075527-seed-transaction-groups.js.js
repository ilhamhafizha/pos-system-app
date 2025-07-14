'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('TransactionGroups', [
      {
        id: 1,
        user_id: 1,
        order_number: 'ORD-001',
        transaction_type: 'dine_in',
        customer_name: 'Budi',
        table: 'A1',
        subtotal_group: 88000,
        tax: 10000,
        total: 98000,
        cash: 120000,
        cashback: 22000,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    await queryInterface.sequelize.query(`ALTER SEQUENCE "TransactionGroups_id_seq" RESTART WITH 2`);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('TransactionGroups', null, {});
  }
};
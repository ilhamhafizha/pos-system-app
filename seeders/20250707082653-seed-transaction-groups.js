'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('TransactionGroups', [{
      user_id: 6,
      order_number: 'ORD-001',
      transaction_type: 'dine_in',
      customer_name: 'Budi',
      table: 'A1',
      subtotal_group: 100000,
      tax: 10000,
      total: 110000,
      cash: 120000,
      cashback: 10000,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('TransactionGroups', null, {});
  }
};

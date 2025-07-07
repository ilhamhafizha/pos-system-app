'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('TransactionItems', [
      {
        transaction_group_id: 3,
        catalog_id: 1, // Nasi Goreng
        quantity: 2,
        note: 'Tanpa cabe',
        subtotal: 50000, // 2 x 25000
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        transaction_group_id: 3,
        catalog_id: 2, // Es Teh Manis
        quantity: 1,
        note: 'Es sedikit',
        subtotal: 8000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        transaction_group_id: 3,
        catalog_id: 3, // Pudding Coklat
        quantity: 2,
        note: 'Topping coklat extra',
        subtotal: 30000, // 2 x 15000
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('TransactionItems', null, {});
  }
};

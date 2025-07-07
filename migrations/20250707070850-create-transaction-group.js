'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TransactionGroups', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // sesuaikan nama tabel user
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      order_number: Sequelize.STRING,
      transaction_type: Sequelize.ENUM('dine_in', 'take_away'),
      customer_name: Sequelize.STRING,
      table: Sequelize.STRING,
      subtotal_group: Sequelize.INTEGER,
      tax: Sequelize.INTEGER,
      total: Sequelize.INTEGER,
      cash: Sequelize.INTEGER,
      cashback: Sequelize.INTEGER,
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('TransactionGroups');
  }
};
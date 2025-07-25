'use strict';
  
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Catalogs', [
      {
        id: 1,
        image: 'https://dummyimage.com/food1.jpg',
        name: 'Nasi Goreng',
        category: 'foods',
        price: 25000,
        description: 'Nasi goreng spesial dengan telur dan ayam.',
        is_deleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        image: 'https://dummyimage.com/beverage1.jpg',
        name: 'Es Teh Manis',
        category: 'beverages',
        price: 8000,
        description: 'Minuman teh manis dingin.',
        is_deleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        image: 'https://dummyimage.com/dessert1.jpg',
        name: 'Pudding Coklat',
        category: 'dessert',
        price: 15000,
        description: 'Pudding coklat lembut dengan topping susu.',
        is_deleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // Reset auto increment sequence
    await queryInterface.sequelize.query(`ALTER SEQUENCE "Catalogs_id_seq" RESTART WITH 4`);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Catalogs', null, {});
  }
};

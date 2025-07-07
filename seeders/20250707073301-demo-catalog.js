'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Catalogs', [
      {
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
        image: 'https://dummyimage.com/dessert1.jpg',
        name: 'Pudding Coklat',
        category: 'dessert',
        price: 15000,
        description: 'Pudding coklat lembut dengan topping susu.',
        is_deleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Catalogs', null, {});
  }
};

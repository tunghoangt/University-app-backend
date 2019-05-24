'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('People', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
    const now = new Date();
    return queryInterface.bulkInsert(
      'Todos',
      [
        {
          name: 'First Todo',
          done: false,
          createdAt: now,
          updatedAt: now,
        },
        {
          name: 'Second Todo',
          done: false,
          createdAt: now,
          updatedAt: now,
        },
      ],
      {},
    );
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
    return queryInterface.bulkDelete('Todos', null, {});
  },
};

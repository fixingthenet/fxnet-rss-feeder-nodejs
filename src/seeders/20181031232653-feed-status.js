module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.bulkInsert('feed_status', [
          {
              name: 'green',
              label: 'Green',
          },
          {
              name: 'yellow',
              label: 'Yellow',
          },
          {
              name: 'red',
              label: 'Red',
          },

      ], {});
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.bulkDelete('feeed_status', null, {});
  }
};

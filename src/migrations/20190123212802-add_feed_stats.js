'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn(
          'feeds',
          'last_success_at',
          Sequelize.DATE,
      );
      await queryInterface.addColumn(
          'feeds',
          'last_success_count',
          Sequelize.INTEGER,
          {default: 0}
      );
      await queryInterface.addColumn(
          'feeds',
          'last_failed_count',
          Sequelize.INTEGER,
          {default: 0}
      );
      await queryInterface.addColumn(
          'feeds',
          'last_failed_at',
          Sequelize.DATE
      );
      return true
  },

  down: async (queryInterface, Sequelize) => {
      await queryInterface.removeColumn(
          'feeds',
          'last_success_at',
      );
      await queryInterface.removeColumn(
          'feeds',
          'last_success_count',
      );
      await queryInterface.removeColumn(
          'feeds',
          'last_failed_count',
      );
      await queryInterface.removeColumn(
          'feeds',
          'last_failed_at',
      );

  }
};

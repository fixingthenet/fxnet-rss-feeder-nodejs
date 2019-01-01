'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('feed_status', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        label: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('feed_status');
  }
};

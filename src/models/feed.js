'use strict';
module.exports = (sequelize, DataTypes) => {
    const Feed = sequelize.define('Feed', {
        name: {
            type: DataTypes.STRING,
            unique: true
        },

    }, {
        createdAt: false,
        updatedAt: false,
        paranoid: false,
        underscored: true,
        tableName: 'feeds',
    });

    return Feed;
};

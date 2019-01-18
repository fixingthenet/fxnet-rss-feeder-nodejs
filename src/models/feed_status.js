'use strict';
module.exports = (sequelize, DataTypes) => {
    const FeedStatus = sequelize.define('FeedStatus', {
        name: {
            type: DataTypes.STRING,
            unique: true
        },
        label: {
            type: DataTypes.STRING,
            unique: true
        },

    }, {
        createdAt: false,
        updatedAt: false,
        paranoid: false,
        underscored: true,
        tableName: 'feed_status',
    });

    return FeedStatus
}

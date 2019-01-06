'use strict';

module.exports = (sequelize, DataTypes) => {
    const UserOpen = sequelize.define('UserOpen', {
        last_opened_at: {
            type: DataTypes.DATE
        },
        read_later_at: {
            type: DataTypes.DATE
        },
    }, {
        createdAt: false,
        updatedAt: false,
        paranoid: false,
        underscored: true,
        tableName: 'user_opens',
    });

    return UserOpen;
};

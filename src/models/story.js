'use strict';

module.exports = (sequelize, DataTypes) => {
    const Story = sequelize.define('Story', {
        title: {
            type: DataTypes.STRING
        },
        permalink: {
            type: DataTypes.STRING
        },
        published: {
            type: DataTypes.DATE
        },
        body: {
            type: DataTypes.STRING
        },
        entry_id: {
            type: DataTypes.STRING
        },
        updated_at: {
            type: DataTypes.DATE
        }

    }, {
        createdAt: false,
        paranoid: false,
        underscored: true,
        tableName: 'stories',
    });
    Story.associate = function(models) {
        console.log("Assoc: Story -> Feed", models.Feed.name)
        Story.Feed=Story.belongsTo(models.Feed, {foreignKey: 'feed_id',
                                      as: 'feed'});
        // associations can be defined here
    };

    return Story;
};

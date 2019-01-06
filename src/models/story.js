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
        scopes: {
            ofUserId: function(userId) {
                console.log("scoped:",
                            userId,
                            sequelize.models.UserOpen.name,
                            sequelize.models.Story.name)

                return {

                    include: [{
                        required: false,
                        model: sequelize.models.UserOpen,
                        attributes: [["last_opened_at","last_opened_at"]],
                        where: {
                            user_id: {
                                [sequelize.Op.or]: [null, userId]
                            }
                        }
                    }]


                }
            }
        }
    });
    Story.associate = function(models) {
        console.log("Assoc: Story -> Feed", models.Feed.name)
        Story.Feed=Story.belongsTo(models.Feed, {foreignKey: 'feed_id',
                                                 as: 'feed'});
        // we're faking!
        Story.hasOne(models.UserOpen, {foreignKey: 'story_id'} )
        // associations can be defined here
    };

    return Story;
};

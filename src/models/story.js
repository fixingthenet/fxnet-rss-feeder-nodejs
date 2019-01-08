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
            onlyUnread: function() {
                return {
                    include: [{
                        required: false,
                        model: sequelize.models.UserOpen,
                        where: { "last_opened_at": null}
                    }]
                }
            },
            onlyMarked: function() {
                return {
                    include: [{
                        required: false,
                        model: sequelize.models.UserOpen,
                        where: { "read_later_at": {[sequelize.Op.ne]:null}}
                    }]
                }
            },
            ofUserId: function(userId) {
                console.log("scoped:",
                            userId,
                            sequelize.models.UserOpen.name,
                            sequelize.models.Story.name)

                return {

                    include: [{
                        required: false,
                        model: sequelize.models.UserOpen,
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
    Story.markOpened = async function(storyId,userId) {
        var lo=new Date()
        console.log("find or create", storyId, userId)
        var res= await sequelize.models.UserOpen.findOrCreate({
            where: {
                story_id: storyId,
                user_id: userId,
            },
            defaults: {
                last_opened_at: new Date()
            }
        })

        if (res[1]) {
            console.log("created ....")
        } else {
            await res[0].update({last_opened_at: lo})
            console.log("existing ....")
        }
        return { last_opened_at: lo, storyId: storyId }
    }
    return Story;
};

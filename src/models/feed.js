'use strict';
module.exports = (sequelize, DataTypes) => {
    const Feed = sequelize.define('Feed', {
        name: {
            type: DataTypes.STRING,
            unique: true
        },
        url: {
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

    Feed.delete = async function(feedId,userId) {
        console.log("feed delete", feedId, userId)
        var res= await sequelize.models.Feed.findOne({
            where: {
                id: feedId,
            }})
        await res.destroy()
        return { feedId: feed.id }
    }
    return Feed;
};

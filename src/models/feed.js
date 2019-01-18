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
        feed_status_id: {
          type: DataTypes.INTEGER,
//          references: {
//            model: "FeedStatus",
//            key: "id"
//          }
        }
    }, {
//        createdAt: 'inserted_at',
        timestamps: true,
//        updatedAt: true,
        paranoid: false,
        underscored: true,
        tableName: 'feeds',
    });
    Feed.associate = function(models) {
      Feed.FeedStatus=Feed.belongsTo(models.FeedStatus,
                                     {foreignKey: 'feed_status_id'})
    };

    Feed.delete = async function(feedId,userId) {
        console.log("feed delete", feedId, userId)
        var res= await sequelize.models.Feed.findOne({
            where: {
                id: feedId,
            }})
        await res.destroy()
        return { feedId: res.id }
    }

    Feed.add = async function(atts,userId) {
        atts.feed_status_id=1; //TODO: don't hardcode
        atts.updated_at=new Date();
        atts.inserted_at=new Date();
        console.log("feed add", atts, userId)
        var res= await sequelize.models.Feed.create(atts)
        return {feed: res}
    }
    return Feed;
};

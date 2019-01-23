import Parser from 'rss-parser';
import app from '../app'
import {asyncForEach} from './utils'

function arrayDiff(a1,a2) {
    return a1.filter(function(i) {return a2.indexOf(i) < 0;});
}

class FeedImporter {
    constructor(feed) {
        this.feed = feed
        }

    async import() {
        var parser = new Parser();
        try {
            var rssFeed = await parser.parseURL(this.feed.url)
            await this.feed.updateSuccess()
        } catch(e) {
            await this.feed.updateFailure()
            return false
        }
//        console.log(rssFeed.title);

        //fetch all stories by entity_id/guid
        //identify missing, insert the ones not there
        var feedEntryIds = rssFeed.items.map((item) => {
            return item.guid || item.id
        })

        var storedStories=await app.models.Story.findAll({
            where: {entry_id: feedEntryIds,
                    feed_id: this.feed.id }})
        var storedEntryIds=storedStories.map(story => {return story.entry_id} )

        var toInsertEntryIds=arrayDiff(feedEntryIds, storedEntryIds)
//        console.log("stories: ",
//                    feedEntryIds,
//                    storedEntryIds,
//                    toInsertEntryIds
//                    )

        asyncForEach(rssFeed.items, async item => {
            if (toInsertEntryIds.indexOf(item.guid)>0) {
                try {
                    var story = await app.models.Story.create({
                        title: item.title,
                        permalink: item.link,
                        entry_id: item.guid || item.id,
                        published: new Date(item.pubDate),
                        feed_id: this.feed.id,
                        body: item.content,
                    })

                    console.log("INSERTING:",
                                item.guid || item.id,
                                item.title,
                                item.link)
                } catch(e) {
                    console.log("ERROR INSERTING:",
                                item.guid || item.id,
                                item.title,
                                item.link)
                }
            }
        });
        return true
    }
}


export default FeedImporter

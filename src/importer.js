//http://millermedeiros.github.io/mdoc/examples/node_api/doc/repl.htm
//https://node.readthedocs.io/en/latest/api/readline/

import app from './app';
import FeedImporter from './lib/feed_importer'
import {asyncForEach} from './lib/utils'



async function importFeed(feed) {
    try {
        console.log("Importing: ", feed.url);
        var importer = new FeedImporter(feed)
        var ok= await importer.import();
        console.log("Imported: ", feed.url, true);
    } catch(e) {
        console.log("Failed to import: ", feed.url, e);
    }
}

async function start() {
    var feeds = await app.models.Feed.findAll() //{where: { id: [1]}});

    await asyncForEach( feeds, importFeed )
    return true
}


start().then((result) => {
    console.log("DONE", result)
   process.exit(0)
}).catch((e)=> {
    console.log("ERROR",e)
    process.exit(1)
})

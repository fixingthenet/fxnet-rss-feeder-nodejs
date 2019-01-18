import { createContext, EXPECTED_OPTIONS_KEY } from 'dataloader-sequelize';
import { resolver,
         createConnection,
         createNodeInterface} from 'graphql-sequelize';
import { globalIdField,
         fromGlobalId,
         mutationWithClientMutationId,
       } from 'graphql-relay';

import models from './models';
const {ApolloServer, gql } = require('apollo-server-express');
import { GraphQLSchema,
         GraphQLObjectType,
         GraphQLList,
         GraphQLNonNull,
         GraphQLInt,
         GraphQLString,
         GraphQLBoolean,
         GraphQLID,
         GraphQLEnumType,
       } from 'graphql';
import GraphQLDate from 'graphql-date'

// https://github.com/mickhansen/graphql-sequelize/blob/master/docs/relay.md
const {
    nodeInterface,
    nodeField,
    nodeTypeMapper,
} = createNodeInterface(models.sequelize);

resolver.contextToOptions = { [EXPECTED_OPTIONS_KEY]: EXPECTED_OPTIONS_KEY };

let feedType = new GraphQLObjectType({
    name: 'Feed',
    description: 'A feed',
    fields: {
        id: globalIdField(models.Story.name),
        name: {
            type: GraphQLString,
            description: 'The name of the feed.',
        },
        url: {
            type: GraphQLString,
            description: 'The url of the feed.',
        }
    },
    interfaces: [nodeInterface],
});

let storyType = new GraphQLObjectType({
    name: 'Story',
    description: 'A RSS story',
    fields: {
        id: globalIdField(models.Story.name),
        permalink: {
            type: GraphQLString,
            description: 'The permalink to the story.',
        },
        entry_id: {
            type: GraphQLString,
            description: 'ID of the story.',
        },
        last_opened_at: {
            type: GraphQLDate,
            description: 'When the article was open last time.',
            resolve: (obj) => {
//                console.log(obj.UserOpen)
                try {
                    return obj.UserOpen.last_opened_at
                } catch(e) {
                    return null
                }

            }
        },
        read_later_at: {
            type: GraphQLDate,
            description: 'When the article was bookmarked.',
            resolve: (obj) => {
                //                console.log(obj.UserOpen)
                try {
                    return obj.UserOpen.read_later_at
                } catch(e) {
                    return null
                }

            }
        },
        published: {
            type: GraphQLDate,
            description: 'Publishing date of story',
        },
        body: {
            type: GraphQLString,
            description: 'Body of the story',
        },
        safeBody: {
            type: GraphQLString,
            description: 'Sanatized Body of the story',
        },
        title: {
            type: GraphQLString,
            description: 'The title of the stroy.',
        },
        feed: {
            type: feedType,
            resolve: resolver(models.Story.Feed)
        }
    },
    interfaces: [nodeInterface],
});

const storyConnection = createConnection({
  name: 'stories',
  nodeType: storyType,
    target: function(source,args,ctx,info) {
        var model=models.Story;

        // join(left OpenStory) on story.id==useropen.story_id
        // and (useropen.user_id is null or
        // useropen.user_id == ctx.user.id )
        console.log("secCtx:",ctx.secCtx.user.id)
        console.log("args:", args)
        var scopes=[]

        if (args.onlyUnread) {
            console.log("Filtering unread")
            scopes.push({ method: ['onlyUnread', ctx.secCtx.user.id] })
        } else if (args.onlyMarked) {
            console.log("Filtering bookmarked")
            scopes.push({ method: ['onlyMarked', ctx.secCtx.user.id] })
        } else {
            scopes.push({ method: ['ofUserId', ctx.secCtx.user.id] })
        }

        console.log("scopes: ", scopes)
        return models.Story.scope(scopes)
    },
    orderBy: new GraphQLEnumType({
        name: 'orderBy',
        values: {
            AGE: {value: ['id', 'DESC']},
        },
    }),
});

const feedConnection = createConnection({
  name: 'feeds',
  nodeType: feedType,
    target: function(source,args,ctx,info) {
        //var model=models.Feed;

        // join(left OpenStory) on story.id==useropen.story_id
        // and (useropen.user_id is null or
        // useropen.user_id == ctx.user.id )
        console.log("secCtx:",ctx.secCtx.user.id)
        console.log("args:", args)
        return models.Feed
    },
//    orderBy: new GraphQLEnumType({
//        name: 'orderBy',
//        values: {
//            AGE: {value: ['id', 'DESC']},
//        },
//    }),
});

var deleteFeedMutation = mutationWithClientMutationId({
    name: 'deleteFeed',
    inputFields: {
        feedId: {
            type: new GraphQLNonNull(GraphQLID),

        }
    },
    outputFields: {
        feedId: {
            type: new GraphQLNonNull(GraphQLID),
            resolve: (data) => data.feedId,

        },
    },
    mutateAndGetPayload: async ({feedId},ctx,args) => {
        var realId=fromGlobalId(feedId).id;
        console.log("feedId: ", realId,ctx.secCtx.user.id)
        var result = await models.Feed.delete(realId,
                                             ctx.secCtx.user.id)
        console.log("result:", result)
        return result
    }
});
var createFeedMutation = mutationWithClientMutationId({
    name: 'createFeed',
    inputFields: {
        name: {
            type: new GraphQLNonNull(GraphQLString),

        },
        url: {
            type: new GraphQLNonNull(GraphQLString),

        }
    },
    outputFields: {
        feed: {
            type: feedType,
            resolve: (data) => data.feed,

        },
    },
    mutateAndGetPayload: async (atts,ctx,args) => {
        var result = await models.Feed.add(atts,
                                              ctx.secCtx.user.id)
        console.log("result:", result)
        return result
    }
});


var openStoryMutation = mutationWithClientMutationId({
    name: 'openStory',
    inputFields: {
        storyId: {
            type: new GraphQLNonNull(GraphQLID),

        }
    },
    outputFields: {
        storyId: {
            type: new GraphQLNonNull(GraphQLID),
            resolve: (data) => data.storyId,

        },
        last_opened_at: {
            type: GraphQLDate,
            resolve: (data) => data.last_opened_at,
        }
    },
    mutateAndGetPayload: async ({storyId},ctx,args) => {
        var realStoryId=fromGlobalId(storyId).id;
        console.log("storyId: ", realStoryId,ctx.secCtx.user.id)
        var result = await models.Story.open(realStoryId,
                                                   ctx.secCtx.user.id)
        console.log("result:", result)
        return result
    }
});

var unopenStoryMutation = mutationWithClientMutationId({
    name: 'unopenStory',
    inputFields: {
        storyId: {
            type: new GraphQLNonNull(GraphQLID),

        }
    },
    outputFields: {
        storyId: {
            type: new GraphQLNonNull(GraphQLID),
            resolve: (data) => data.storyId,

        },
    },
    mutateAndGetPayload: async ({storyId},ctx,args) => {
        var realStoryId=fromGlobalId(storyId).id;
        console.log("storyId: ", realStoryId,ctx.secCtx.user.id)
        var result = await models.Story.unopen(realStoryId,
                                                   ctx.secCtx.user.id)
        console.log("result:", result)
        return result
    }
});


var bookmarkStoryMutation = mutationWithClientMutationId({
    name: 'bookmarkStory',
    inputFields: {
        storyId: {
            type: new GraphQLNonNull(GraphQLID),

        }
    },
    outputFields: {
        storyId: {
            type: new GraphQLNonNull(GraphQLID),
            resolve: (data) => data.storyId,

        },
        read_later_at: {
            type: GraphQLDate,
            resolve: (data) => data.read_later_at,
        }
    },
    mutateAndGetPayload: async ({storyId},ctx,args) => {
        var realStoryId=fromGlobalId(storyId).id;
        console.log("storyId: ", realStoryId,ctx.secCtx.user.id)
        var result = await models.Story.bookmark(realStoryId,
                                                   ctx.secCtx.user.id)
        console.log("result:", result)
        return result
    }
});

var unbookmarkStoryMutation = mutationWithClientMutationId({
    name: 'unbookmarkStory',
    inputFields: {
        storyId: {
            type: new GraphQLNonNull(GraphQLID),

        }
    },
    outputFields: {
        storyId: {
            type: new GraphQLNonNull(GraphQLID),
            resolve: (data) => data.storyId,

        },
    },
    mutateAndGetPayload: async ({storyId},ctx,args) => {
        var realStoryId=fromGlobalId(storyId).id;
        console.log("storyId: ", realStoryId,ctx.secCtx.user.id)
        var result = await models.Story.unbookmark(realStoryId,
                                                 ctx.secCtx.user.id)
        console.log("result:", result)
        return result
    }
});


nodeTypeMapper.mapTypes({
    [models.Story.name]: storyType,
});
nodeTypeMapper.mapTypes({
    [models.Feed.name]: feedType,
});

const schema = new GraphQLSchema({
    name: 'RootType',
    mutation: new GraphQLObjectType({
        name: 'Mutations',
        fields: {
            openStory: openStoryMutation,
            unopenStory: unopenStoryMutation,
            bookmarkStory: bookmarkStoryMutation,
            unbookmarkStory: unbookmarkStoryMutation,
            deleteFeed: deleteFeedMutation,
            createFeed: createFeedMutation,
        }
    }),
    query: new GraphQLObjectType({
        name: 'Queries',
        fields: {
            story: {
                type: storyType,
                args: {
                    id: {
                        type: GraphQLID
                    }
                },
                resolve: resolver(models.Story)
            },
            feeds: {
            type: feedConnection.connectionType,
            resolve: function(source,args,ctx,info) {
                //console.log("source",source)
                console.log("args",args)
                //console.log("ctx",ctx)
                //console.log("info",info)

                return feedConnection.resolve(source,args,ctx,info)
            },
            args: {
                ...storyConnection.connectionArgs,
            }
        },

            stories: {
                type: storyConnection.connectionType,
                resolve: function(source,args,ctx,info) {
                    //console.log("source",source)
                    console.log("args",args)
                    //console.log("ctx",ctx)
                    //console.log("info",info)

                    return storyConnection.resolve(source,args,ctx,info)
                },
                args: {
                    ...storyConnection.connectionArgs,
                    onlyUnread: {
                        type: GraphQLBoolean,
                        description: 'get only unread'
                    },
                    onlyMarked: {
                        type: GraphQLBoolean,
                        description: 'get only marked'
                    },

                }
            },

            node: nodeField,
        },

    })
});


const server = new ApolloServer({
//    typeDefs,
    //    resolvers,
    schema: schema,
    introspection: true,
    playground: true,
    debug: true,
    tracing: true,
    context: async ({req}) => {
        var userId;
        try {
            var token = req.headers['access-token']
            var decoded = tokenHandler.verify(token)
            userId=decoded.user.id
        } catch (e) {
            userId=3 //
        }
        //      console.log("secCtx", user.id, token)
        const dataloaderContext = createContext(models.sequelize);

        return { models: models,
                 secCtx: { user: {id: userId}},
                 [EXPECTED_OPTIONS_KEY]: dataloaderContext,
               }
   },
});

export default server;

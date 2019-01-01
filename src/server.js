import { createContext, EXPECTED_OPTIONS_KEY } from 'dataloader-sequelize';
import { resolver,
         createConnection,
         createNodeInterface} from 'graphql-sequelize';
import { globalIdField } from 'graphql-relay';

import models from './models';
const {ApolloServer, gql } = require('apollo-server-express');
import { GraphQLSchema,
         GraphQLObjectType,
         GraphQLList,
         GraphQLNonNull,
         GraphQLInt,
         GraphQLString,
         GraphQLID,
         GraphQLEnumType,
       } from 'graphql';

// https://github.com/mickhansen/graphql-sequelize/blob/master/docs/relay.md
const {
  nodeInterface,
  nodeField,
  nodeTypeMapper
} = createNodeInterface(models.sequelize);

//import sessionLogin from './api/session_login.js'
//import changePassword from './api/changePassword.js'
//import tokenHandler from './lib/tokenHandler'
//createFeed(feed: FeedInput): FeedResult
//updateFeed(feedId: ID, feed: FeedInput): FeedResult
//deleteFeed(feedId: ID): FeedResult
// const typeDefs = gql`
//   type Query {
//     stories: [Story]
//     feeds: [Feed]
//     feed(feedId: ID): Feed
//   }

//   type Mutation {
//     openStory(storyId: ID!): Success
//     unOpenStory(storyId: ID!): Success
//     markStory(storyId: ID!): Success
//     unMarkStory(storyId: ID!): Success
//   }

//   type Story {
//     id: ID
//     title: String
//     permalink: String
//     published:  String
//     body: String
//     entry_id: String
//     feed: Feed
//   }

//   type FeedResult {
//     id: ID
//     errors: InputError
//   }

//   type Success {
//     success: Boolean
//     errors: InputError
//   }

//   type FeedInput {
//     name: String!
//     url: String!
//   }

//   type Feed {
//     id: ID
//     name: String!
//     url: String!
//   }

//   type InputError {
//     base: String
//     fields: [FieldError]
//   }

//   type FieldError {
//     name: String!
//     errors: [String!]
//   }
// `;

// // const resolvers = {
// //     Query: {
// //         stories: resolver(models.Story),
// //         feeds: resolver(models.Feed),
// //         feed: resolver(models.Feed),
//     },
//     Mutation: {
//     }
// };

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

        //{
        //    type: globalIdField(models.Story.name),
        //    description: 'The id of the story.',
        //},
        title: {
            type: GraphQLString,
            description: 'The name of the user.',
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
  target: models.Story,
  orderBy: new GraphQLEnumType({
    name: 'orderBy',
    values: {
      AGE: {value: ['id', 'DESC']},
    }
  }),
  // connectionFields: {
  //   total: {
  //     type: GraphQLInt,
  //     resolve: ({source}) => {
  //       return source.countTasks();
  //     }
  //   }
  // },
  // edgeFields: {
  //   wasCreatedByUser: {
  //     type: GraphQLBoolean,
  //     resolve: (edge) => {
  //       /*
  //        * We attach the connection source to edges
  //        */
  //       return edge.node.createdBy === edge.source.id;
  //     }
  //   }
  // }
});


nodeTypeMapper.mapTypes({
    [models.Story.name]: storyType,
});
nodeTypeMapper.mapTypes({
    [models.Feed.name]: feedType,
});

const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'RootType',
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
                // The resolver will use `findOne` or `findAll` depending on whether the field it's used in is a `GraphQLList` or not.
                type: new GraphQLList(feedType),
                args: {
                },
                resolve: resolver(models.Feed)
            },

            stories: {
                type: storyConnection.connectionType,
                resolve: storyConnection.resolve,
                args: storyConnection.connectionArgs,
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
            userId=5 //
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

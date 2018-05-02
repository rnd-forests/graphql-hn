import { GraphQLServer } from 'graphql-yoga'
import { Prisma } from 'prisma-binding'

import Query from './resolvers/Query'
import Mutation from './resolvers/Mutation'
import AuthPayload from './resolvers/AuthPayload'
import Subscription from './resolvers/Subscription'
import Feed from './resolvers/Feed'

const resolvers = {
    Query,
    Mutation,
    AuthPayload,
    Subscription,
    Feed,
}

const server = new GraphQLServer({
    typeDefs: './src/schema/main.graphql',
    resolvers,
    resolverValidationOptions: {
        requireResolversForResolveType: false
    },
    context: req => ({
        ...req,
        db: new Prisma({
            typeDefs: 'src/schema/prisma.graphql',
            endpoint: process.env.PRISMA_ENDPOINT,
            secret: process.env.PRISMA_SECRET,
            debug: true,
        }),
    }),
})
server.start(() => console.log('GraphQL server is running...'))

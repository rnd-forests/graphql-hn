const { GraphQLServer } = require("graphql-yoga")
const { Prisma } = require("prisma-binding")

const resolvers = {
    Query: {
        feed: (root, args, context, info) => {
            return context.db.query.links({}, info)
        },

        link: (root, args, context, info) => {
            return context.db.query.link({
                where: {
                    id: args.id
                }
            }, info)
        }
    },

    Mutation: {
        storeLink: (root, args, context, info) => {
            return context.db.mutation.createLink({
                data: {
                    url: args.url,
                    description: args.description
                }
            }, info)
        },

        updateLink: (root, args, context, info) => {
            return context.db.mutation.updateLink({
                data: {
                    url: args.url,
                    description: args.description
                },

                where: {
                    id: args.id
                }
            }, info)
        },

        deleteLink: (root, args, context, info) => {
            return context.db.mutation.deleteLink({
                where: {
                    id: args.id
                }
            }, info)
        }
    },
}

const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers,
    context: req => ({
        ...req,
        db: new Prisma({
            typeDefs: 'src/generated/prisma.graphql',
            endpoint: 'http://localhost:4466/hackernews/dev',
            secret: 'mysecret123',
            debug: true,
        }),
    }),
})
server.start(() => console.log('Server is running on http://localhost:4000'))

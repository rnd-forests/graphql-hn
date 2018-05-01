const { GraphQLServer } = require('graphql-yoga')

let links = [{
    id: 'link-0',
    url: 'www.howtographql.com',
    description: 'Fullstack tutorial for GraphQL'
}]

let idCount = links.length

const resolvers = {
    Query: {
        info: () => 'This is the API of a Hackernews Clone',
        feed: () => links,
        link: (root, args) => {
            let result = links.find(link => link.id === args.id)
            if (result === undefined) {
                return new Error('Cannot find the link with the given ID.')
            }
            return result
        }
    },

    Mutation: {
        storeLink: (root, args) => {
            const link = {
                id: `link-${idCount++}`,
                description: args.description,
                url: args.url,
            }
            links.push(link)
            return link
        },

        updateLink: (root, args) => {
            let idx = links.findIndex(link => link.id === args.id)
            if (idx === -1) {
                return new Error('Cannot find the link with the given ID.')
            }
            let link = links[idx]
            link.url = args.url
            link.description = args.description
            links[idx] = link
            return link
        },

        deleteLink: (root, args) => {
            let idx = links.findIndex(link => link.id === args.id)
            if (idx === -1) {
                return new Error('Cannot find the link with the given ID.')
            }

            return links.splice(idx, 1)[0]
        }
    },

    // GraphQL server can automatically infers the resolver for
    // the Link type, so we don't need to specifiy it here.
    // Link: {
    //     id: (root, args, context, info) => root.id,
    //     description: (root) => root.description,
    //     url: (root) => root.url,
    // }
}

// Create new server instance and start it
const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers,
})
server.start(() => console.log('Server is running on http://localhost:4000'))

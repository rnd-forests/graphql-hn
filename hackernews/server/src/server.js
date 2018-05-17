import { GraphQLServer } from 'graphql-yoga'
import { Prisma } from 'prisma-binding'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'
import ms from 'ms'

import Auth from './auth'
import { resolvers } from './resolvers'

export default class Server {
  /**
   * @param port
   */
  constructor(port = 4000) {
    this.port = port
    this.secret = process.env.APP_SECRET
    this.devMode = (process.env.NODE_ENV === 'development')
  }

  /**
   * Start the GraphQL server.
   */
  enable() {
    let db = this.createPrismaBinding()

    // Note that req in the context is an object
    // with the form of { request, response, connection }
    let context = (req) => ({ ...req, db })

    let resolverValidationOptions = {
      requireResolversForResolveType: false
    }

    let server = new GraphQLServer({
      typeDefs: './src/schema/main.graphql',
      resolvers,
      resolverValidationOptions,
      context
    })

    server.express.use(cookieParser())
    server.express.use(this.createUserMiddleware(db))

    let options = this.getServerOptions()

    server.start(options).then(() => {
      console.log(`Server started, listening on port ${options.port} for incoming requests.`)
    })
  }

  /**
   * Create Express.js middle to attach tokens and user instance to request cookies.
   *
   * @param {Prisma} db
   * @returns {Function}
   */
  createUserMiddleware(db) {
    return async (req, res, next) => {
      let token = req.headers['x-token']
      if (!token) {
        return next();
      }

      let cookieToken = req.cookies.token

      if (!cookieToken || token !== cookieToken) {
        return next()
      }

      try {
        let { user } = jwt.verify(token, this.secret)
        req.user = user
      } catch (err) {
        let refreshToken = req.headers['x-refresh-token']
        if (!refreshToken) {
          return next();
        }

        let cookieRefreshToken = req.cookies['refresh-token']

        if (!cookieRefreshToken || refreshToken !== cookieRefreshToken) {
          return next()
        }

        let tokens = await Auth.refreshTokens(token, refreshToken, db, this.secret)

        if (tokens.token && tokens.refreshToken) {
          res.set({
            'x-token': tokens.token,
            'x-refresh-token': tokens.refreshToken
          })

          res.cookie('token', tokens.token, {
            maxAge: ms('1d'),
            httpOnly: true
          })

          res.cookie('refresh-token', tokens.refreshToken, {
            maxAge: ms('7d'),
            httpOnly: true
          })
        }
        req.user = tokens.user
      }

      return next()
    }
  }

  /**
   * Get GraphQL server options.
   *
   * @returns {{port: (number|*), endpoint: string, tracing: string, cors: {credentials: boolean, origin: string}, playground: boolean, debug: boolean}}
   */
  getServerOptions() {
    return {
      port: this.port,
      endpoint: '/graphql',
      tracing: 'enabled',
      cors: {
        credentials: true,
        origin: Server.getClientEndpoints(),
        exposedHeaders: ['x-token', 'x-refresh-token'],
        preflightContinue: false,
        optionsSuccessStatus: 200
      },
      debug: this.devMode
    }
  }

  /**
   * Create new Prisma binding instance.
   *
   * @returns {Prisma}
   */
  createPrismaBinding() {
    return new Prisma({
      typeDefs: 'src/schema/generated/database.graphql',
      endpoint: process.env.PRISMA_ENDPOINT,
      secret: process.env.PRISMA_SECRET,
      debug: this.devMode
    })
  }

  /**
   * Get the list of all GraphQL clients connected to this server.
   *
   * @returns {string}
   */
  static getClientEndpoints() {
    return process.env.CLIENT_ENDPOINT
  }
}

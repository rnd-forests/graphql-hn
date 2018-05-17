import { ApolloLink, Observable, Operation } from 'apollo-link'
import { createHttpLink, HttpLink } from 'apollo-link-http'
import { ClientStateConfig, withClientState } from 'apollo-link-state'
import { ErrorLink, onError } from 'apollo-link-error'
import { RetryLink } from 'apollo-link-retry'
import { CacheResolverMap, InMemoryCache } from 'apollo-cache-inmemory'
import ApolloClient from 'apollo-client'
import { DefaultOptions } from 'apollo-client/ApolloClient'

/**
 * Custom client configuration interface.
 */
export interface Configuration {
  request?: (operation: Operation) => Promise<void>
  uri?: string
  fetchOptions?: HttpLink.Options
  clientState?: ClientStateConfig
  onError?: ErrorLink.ErrorHandler
  cacheRedirects?: CacheResolverMap
  defaultOptions?: DefaultOptions
  devTools?: boolean
}

/**
 * @param {Configuration} config
 * @returns {InMemoryCache}
 */
let getCache = (config: Configuration): InMemoryCache => {
  if (config && config.cacheRedirects) {
    return new InMemoryCache({ cacheRedirects: config.cacheRedirects })
  }

  return new InMemoryCache()
}

/**
 * @type {ApolloLink}
 */
let requestSendingLink = new ApolloLink((operation, forward) => {
  // We need to attach two custom headers: x-token and x-refresh-token
  // to the request so that the GraphQL server can perform double submit
  // cookies to validate JWT tokens.
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      'x-token': localStorage.getItem('token') || null,
      'x-refresh-token': localStorage.getItem('refresh-token') || null
    }
  }))

  return forward(operation)
})

/**
 * @type {ApolloLink}
 */
let requestSentLink = new ApolloLink((operation, forward) => {
  return forward(operation).map((data) => {
    let { response: { headers } } = operation.getContext()

    if (headers) {
      let token = headers.get('x-token')
      let refreshToken = headers.get('x-refresh-token')

      if (token) {
        localStorage.setItem('token', token)
      }

      if (refreshToken) {
        localStorage.setItem('refresh-token', refreshToken)
      }
    }

    return data
  })
})

/**
 * @param {Configuration} config
 * @param {InMemoryCache} cache
 * @returns {any}
 */
let getStateLink = (config: Configuration, cache: InMemoryCache): any => {
  if (config && config.clientState) {
    return withClientState({ ...config.clientState, cache })
  }

  return false
}

/**
 * @type {RetryLink}
 */
let retryLink = new RetryLink({
  delay: {
    initial: 200
  },
  attempts: {
    max: 3
  }
})

/**
 * @param {Configuration} config
 * @returns {any}
 */
let getErrorLink = (config: Configuration): any => {
  if (config && config.onError) {
    return onError(config.onError)
  }

  return onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.map(({ message, locations, path }) =>
        console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
      )
    }

    if (networkError) {
      console.log(`[Network error]: ${networkError}`)
    }
  })
}

/**
 * @param {Configuration} config
 * @returns {any}
 */
let getRequestHandler = (config: Configuration): any => {
  if (config && config.request) {
    return new ApolloLink((operation, forward) =>
      new Observable(observer => {
        let handle: any
        Promise.resolve(operation)
          .then(oper => config.request(oper))
          .then(() => {
            handle = forward(operation).subscribe({
              next: observer.next.bind(observer),
              error: observer.error.bind(observer),
              complete: observer.complete.bind(observer)
            })
          })
          .catch(observer.error.bind(observer))

        return () => {
          if (handle) {
            handle.unsubscribe()
          }
        }
      })
    )
  }
  return false
}

/**
 * Create a new HTTP link which is use to fetch GraphQL
 * results from a GraphQL endpoint over an HTTP connection.
 * This is a terminating link and should be place at the
 * end of the link chain.
 *
 * @param {Configuration} config
 * @returns {ApolloLink}
 */
let getHttpLink = (config: Configuration): ApolloLink => {
  return createHttpLink({
    uri: (config && config.uri) || '/graphql',
    fetchOptions: (config && config.fetchOptions) || {}
  })
}

export default class Client<TCache> extends ApolloClient<TCache> {
  /**
   * @param {Configuration} config
   */
  constructor(config: Configuration) {
    let cache = getCache(config)

    let stateLink = getStateLink(config, cache)
    let errorLink = getErrorLink(config)
    let requestHandler = getRequestHandler(config)
    let httpLink = getHttpLink(config)
    let httpLinkWithMiddleware = requestSentLink.concat(
      requestSendingLink.concat(httpLink)
    )
    let link = ApolloLink.from([
      errorLink,
      retryLink,
      stateLink,
      requestHandler,
      httpLinkWithMiddleware
    ].filter(x => !!x) as ApolloLink[])

    let defaultOptions = config.defaultOptions
    let connectToDevTools = config.devTools

    super({ cache, link, connectToDevTools, defaultOptions } as any)
  }
}

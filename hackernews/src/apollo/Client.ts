import { ApolloLink, Observable, Operation } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { ClientStateConfig, withClientState } from 'apollo-link-state'
import { ErrorLink, onError } from 'apollo-link-error'
import { CacheResolverMap, InMemoryCache } from 'apollo-cache-inmemory'
import ApolloClient from 'apollo-client'
import { DefaultOptions } from 'apollo-client/ApolloClient'

export interface ClientConfig {
  request?: (operation: Operation) => Promise<void>;
  uri?: string;
  fetchOptions?: HttpLink.Options;
  clientState?: ClientStateConfig;
  onError?: ErrorLink.ErrorHandler;
  cacheRedirects?: CacheResolverMap;
  defaultOptions?: DefaultOptions;
  devTools?: boolean;
}

/**
 * @param {ClientConfig} config
 * @returns {InMemoryCache}
 */
let getCache = (config: ClientConfig): InMemoryCache => {
  if (config && config.cacheRedirects) {
    return new InMemoryCache({ cacheRedirects: config.cacheRedirects })
  }

  return new InMemoryCache()
}

/**
 * @param {ClientConfig} config
 * @param {InMemoryCache} cache
 * @returns {any}
 */
let getStateLink = (config: ClientConfig, cache: InMemoryCache): any => {
  if (config && config.clientState) {
    return withClientState({ ...config.clientState, cache })
  }

  return false
}

/**
 * @param {ClientConfig} config
 * @returns {any}
 */
let getErrorLink = (config: ClientConfig): any => {
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
 * @param {ClientConfig} config
 * @returns {any}
 */
let getRequestHandler = (config: ClientConfig): any => {
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
 * @param {ClientConfig} config
 * @returns {HttpLink}
 */
let getHttpLink = (config: ClientConfig): HttpLink => {
  return new HttpLink({
    uri: (config && config.uri) || '/graphql',
    fetchOptions: (config && config.fetchOptions) || {},
    credentials: 'same-origin'
  })
}

export default class Client<TCache> extends ApolloClient<TCache> {
  /**
   * @param {ClientConfig} config
   */
  constructor(config: ClientConfig) {
    let cache = getCache(config)
    let stateLink = getStateLink(config, cache)
    let errorLink = getErrorLink(config)
    let requestHandler = getRequestHandler(config)
    let httpLink = getHttpLink(config)
    let defaultOptions = config.defaultOptions
    let connectToDevTools = config.devTools
    let link = ApolloLink.from([
      errorLink,
      requestHandler,
      stateLink,
      httpLink
    ].filter(x => !!x) as ApolloLink[])

    super({ cache, link, connectToDevTools, defaultOptions } as any)
  }
}

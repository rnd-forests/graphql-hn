var __extends =
  (this && this.__extends) ||
  (function() {
    var extendStatics =
      Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array &&
        function(d, b) {
          d.__proto__ = b
        }) ||
      function(d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]
      }
    return function(d, b) {
      extendStatics(d, b)
      function __() {
        this.constructor = d
      }
      d.prototype =
        b === null ? Object.create(b) : ((__.prototype = b.prototype), new __())
    }
  })()
var __assign =
  (this && this.__assign) ||
  Object.assign ||
  function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i]
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p]
    }
    return t
  }
Object.defineProperty(exports, '__esModule', { value: true })
var apollo_link_1 = require('apollo-link')
var apollo_link_http_1 = require('apollo-link-http')
var apollo_link_state_1 = require('apollo-link-state')
var apollo_link_error_1 = require('apollo-link-error')
var apollo_link_retry_1 = require('apollo-link-retry')
var apollo_cache_inmemory_1 = require('apollo-cache-inmemory')
var apollo_client_1 = require('apollo-client')
var getCache = function(config) {
  if (config && config.cacheRedirects) {
    return new apollo_cache_inmemory_1.InMemoryCache({
      cacheRedirects: config.cacheRedirects
    })
  }
  return new apollo_cache_inmemory_1.InMemoryCache()
}
var requestSendingLink = new apollo_link_1.ApolloLink(function(
  operation,
  forward
) {
  operation.setContext(function(_a) {
    var _b = _a.headers,
      headers = _b === void 0 ? {} : _b
    return {
      headers: __assign({}, headers, {
        'x-token': localStorage.getItem('token') || null,
        'x-refresh-token': localStorage.getItem('refresh-token') || null
      })
    }
  })
  return forward(operation)
})
var requestSentLink = new apollo_link_1.ApolloLink(function(
  operation,
  forward
) {
  return forward(operation).map(function(data) {
    var headers = operation.getContext().response.headers
    if (headers) {
      var token = headers.get('x-token')
      var refreshToken = headers.get('x-refresh-token')
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
var getStateLink = function(config, cache) {
  if (config && config.clientState) {
    return apollo_link_state_1.withClientState(
      __assign({}, config.clientState, { cache: cache })
    )
  }
  return false
}
var retryLink = new apollo_link_retry_1.RetryLink({
  delay: {
    initial: 200
  },
  attempts: {
    max: 3
  }
})
var getErrorLink = function(config) {
  if (config && config.onError) {
    return apollo_link_error_1.onError(config.onError)
  }
  return apollo_link_error_1.onError(function(_a) {
    var graphQLErrors = _a.graphQLErrors,
      networkError = _a.networkError
    if (graphQLErrors) {
      graphQLErrors.map(function(_a) {
        var message = _a.message,
          locations = _a.locations,
          path = _a.path
        return console.log(
          '[GraphQL error]: Message: ' +
            message +
            ', Location: ' +
            locations +
            ', Path: ' +
            path
        )
      })
    }
    if (networkError) {
      console.log('[Network error]: ' + networkError)
    }
  })
}
var getRequestHandler = function(config) {
  if (config && config.request) {
    return new apollo_link_1.ApolloLink(function(operation, forward) {
      return new apollo_link_1.Observable(function(observer) {
        var handle
        Promise.resolve(operation)
          .then(function(oper) {
            return config.request(oper)
          })
          .then(function() {
            handle = forward(operation).subscribe({
              next: observer.next.bind(observer),
              error: observer.error.bind(observer),
              complete: observer.complete.bind(observer)
            })
          })
          .catch(observer.error.bind(observer))
        return function() {
          if (handle) {
            handle.unsubscribe()
          }
        }
      })
    })
  }
  return false
}
var getHttpLink = function(config) {
  return apollo_link_http_1.createHttpLink({
    uri: (config && config.uri) || '/graphql',
    fetchOptions: (config && config.fetchOptions) || {}
  })
}
var Client = (function(_super) {
  __extends(Client, _super)
  function Client(config) {
    var _this = this
    var cache = getCache(config)
    var stateLink = getStateLink(config, cache)
    var errorLink = getErrorLink(config)
    var requestHandler = getRequestHandler(config)
    var httpLink = getHttpLink(config)
    var httpLinkWithMiddleware = requestSentLink.concat(
      requestSendingLink.concat(httpLink)
    )
    var link = apollo_link_1.ApolloLink.from(
      [
        errorLink,
        retryLink,
        stateLink,
        requestHandler,
        httpLinkWithMiddleware
      ].filter(function(x) {
        return !!x
      })
    )
    var defaultOptions = config.defaultOptions
    var connectToDevTools = config.devTools
    _this =
      _super.call(this, {
        cache: cache,
        link: link,
        connectToDevTools: connectToDevTools,
        defaultOptions: defaultOptions
      }) || this
    return _this
  }
  return Client
})(apollo_client_1.default)
exports.default = Client

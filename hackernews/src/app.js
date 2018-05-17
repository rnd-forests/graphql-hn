import Client from './apollo/Client'

export default class App {
  /**
   * Create new Apollo client with custom options.
   *
   * @returns {Client<any>}
   */
  static createClient() {
    let networkInterface = {
      uri: this.getGraphQLServerUrl(),
      fetchOptions: {
        // We're using cookies for authentication and authorization.
        // This options tells the network interface to send the cookie
        // along with every request. The value here is 'include' because
        // the server and the client is in different domains.
        credentials: 'include'
      },
      devTools: this.inDevelopmentMode()
    }

    return new Client(networkInterface)
  }

  /**
   * Check if application is in development (local) state.
   *
   * @returns {boolean}
   */
  static inDevelopmentMode() {
    return process.env.REACT_APP_ENV === 'local'
  }

  /**
   * Get GraphQL server URL.
   *
   * @returns {string}
   */
  static getGraphQLServerUrl() {
    return process.env.REACT_APP_GRAPHQL_SERVER_URL || '/graphql'
  }
}

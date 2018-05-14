import Client from './apollo/Client'

class App {
  /**
   * Create new Apollo client with predefined options.
   *
   * @returns {Client<any>}
   */
  static getApolloClient() {
    let networkInterface = {
      uri: this.getGraphQLServerUrl(),
      fetchOptions: {
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
    return process.env.REACT_APP_GRAPHQL_SERVER_URL
  }
}

export default App

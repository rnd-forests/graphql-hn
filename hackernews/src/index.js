import React from 'react'
import ReactDOM from 'react-dom'
import './assets/dist/app.css'
import App from './components/App'
import registerServiceWorker from './registerServiceWorker'

import ApolloClient from 'apollo-boost'
import { ApolloProvider } from 'react-apollo'

const client = new ApolloClient({
  uri: 'http://localhost:4000'
})

const apollo = (AppComponent) => (
  <ApolloProvider client={client}>
    <AppComponent />
  </ApolloProvider>
)

ReactDOM.render(apollo(App), document.getElementById('root'))

registerServiceWorker()

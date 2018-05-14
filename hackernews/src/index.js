import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { ApolloProvider } from 'react-apollo'

import App from './App'
import AppComponent from './components/App'
import registerServiceWorker from './registerServiceWorker'

import './assets/dist/app.css'

render(
  <BrowserRouter>
    <ApolloProvider client={App.getApolloClient()}>
      <AppComponent />
    </ApolloProvider>
  </BrowserRouter>,
  document.getElementById('root')
)

registerServiceWorker()

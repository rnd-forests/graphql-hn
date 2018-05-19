import React from 'react'
import { render } from 'react-dom'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { ApolloProvider } from 'react-apollo'
import storage from 'redux-persist/lib/storage'
import { persistStore, persistReducer } from 'redux-persist'
import { PersistGate } from 'redux-persist/integration/react'

import App from './app'
import rootReducer from './reducers'
import AppComponent from './components/App'
import registerServiceWorker from './registerServiceWorker'

import './assets/dist/app.css'

let persistConfig = {
  key: 'hackernews',
  storage
}

let persistedReducer = persistReducer(persistConfig, rootReducer)

let store = createStore(
  persistedReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)

let persistor = persistStore(store)

render(
  <BrowserRouter>
    <ApolloProvider client={App.createClient()}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AppComponent />
        </PersistGate>
      </Provider>
    </ApolloProvider>
  </BrowserRouter>,
  document.getElementById('root')
)

registerServiceWorker()

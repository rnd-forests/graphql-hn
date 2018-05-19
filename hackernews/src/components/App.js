import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'

import LinkList from './LinkList'
import CreateLink from './CreateLink'
import Header from './Header'
import Login from '../containers/Login'
import NotFound from './NotFound'

class App extends Component {
  render() {
    return (
      <div className="container mx-auto">
        <Header />
        <div className="border border-t-0 border-grey p-4 bg-grey-lighter">
          <Switch>
            <Route exact path="/login" component={Login} />
            <Route exact path="/create" component={CreateLink} />
            <Route exact path="/" component={LinkList} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
    )
  }
}

export default App

import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'

import { AUTH_TOKEN } from '../constants'

class Header extends Component {
  render() {
    const authToken = localStorage.getItem(AUTH_TOKEN)

    return (
      <div className="flex justify-between flex-no-wrap bg-orange p-4">
        <div className="flex justify-between">
          <div className="font-bold mr-4">Hacker News</div>
          <Link to="/" className="no-underline hover:underline text-black mr-2">
            news
          </Link>
          {authToken && (
            <Link
              to="/create"
              className="no-underline hover:underline text-black"
            >
              submit
            </Link>
          )}
        </div>
        <div>
          {authToken ? (
            <div
              className="cursor-pointer text-black mr-2"
              onClick={() => {
                localStorage.removeItem(AUTH_TOKEN)
                this.props.history.push(`/`)
              }}
            >
              logout
            </div>
          ) : (
            <Link
              to="/login"
              className="no-underline hover:underline text-black"
            >
              login
            </Link>
          )}
        </div>
      </div>
    )
  }
}

export default withRouter(Header)

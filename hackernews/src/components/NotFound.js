import React, { Component } from 'react'

class NotFound extends Component {
  render() {
    return (
      <div
        className="flex flex-col items-center bg-white text-yellow-darker px-4 py-3"
        role="alert"
      >
        <h2 className="text-black">404</h2>
        <strong className="font-bold">Holy smokes! </strong>
        <span className="block sm:inline">
          The page you're looking for cannot be found.
        </span>
      </div>
    )
  }
}

export default NotFound

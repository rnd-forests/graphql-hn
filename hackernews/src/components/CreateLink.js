import React, { Component } from 'react'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

import { FEED_QUERY } from './LinkList'

class CreateLink extends Component {
  state = {
    description: '',
    url: ''
  }

  render() {
    return (
      <div className="w-full">
        <form className="px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label
              className="block text-grey-darker text-sm font-bold mb-2"
              htmlFor="description"
            >
              link description
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker"
              id="description"
              type="text"
              placeholder="write description..."
              value={this.state.description}
              onChange={(e) => this.setState({ description: e.target.value })}
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-grey-darker text-sm font-bold mb-2"
              htmlFor="url"
            >
              url
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker"
              id="url"
              type="text"
              placeholder="https://example.com"
              value={this.state.url}
              onChange={(e) => this.setState({ url: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue hover:bg-blue-dark text-white font-bold py-2 px-4 rounded"
              type="button"
              onClick={() => this._createLink()}
            >
              submit link
            </button>
          </div>
        </form>
      </div>
    )
  }

  _createLink = async () => {
    const { description, url } = this.state
    await this.props.createLinkMutation({
      variables: {
        description,
        url
      },
      update: (store, { data: { storeLink } }) => {
        const data = store.readQuery({ query: FEED_QUERY })
        data.feed.links.splice(0, 0, storeLink)
        store.writeQuery({
          query: FEED_QUERY,
          data
        })
      }
    })
    this.props.history.push('/')
  }
}

const CREATE_LINK_MUTATION = gql`
  mutation CreateLinkMutation($description: String!, $url: String!) {
    storeLink(description: $description, url: $url) {
      id
      url
      description
      createdAt
    }
  }
`

export default graphql(CREATE_LINK_MUTATION, { name: 'createLinkMutation' })(
  CreateLink
)

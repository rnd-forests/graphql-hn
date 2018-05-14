import React, { Component } from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import toastr from 'toastr'

import Link from './Link'
import Loading from './Loading'

export const FEED_QUERY = gql`
  query FeedQuery {
    feed {
      links {
        id
        url
        description
        createdAt
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
    }
  }
`

class LinkList extends Component {
  render() {
    return (
      <Query query={FEED_QUERY}>
        {({ loading, error, data }) => {
          if (loading) return <Loading />
          if (error) {
            toastr.error(`${error.message}`, 'Cannot fetch the feed!')
          }

          return (
            !error && (
              <div>
                {data.feed.links.map((link, index) => (
                  <Link
                    key={link.id}
                    index={index}
                    link={link}
                    updateStoreAfterVote={this._updateCacheAfterVote}
                  />
                ))}
              </div>
            )
          )
        }}
      </Query>
    )
  }

  _updateCacheAfterVote = (store, createVote, linkId) => {
    let data = store.readQuery({ query: FEED_QUERY })
    let votedLink = data.feed.links.find((link) => link.id === linkId)
    votedLink.votes = createVote.link.votes
    store.writeQuery({ query: FEED_QUERY, data })
  }
}

export default LinkList

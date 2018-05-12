import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import { gql } from 'apollo-boost';
import Link from './Link';

class LinkList extends Component {
  render() {
    if (this.props.feedQuery && this.props.feedQuery.loading) {
      return <div>Loading</div>;
    }

    if (this.props.feedQuery && this.props.feedQuery.error) {
      return <div>Error</div>;
    }

    let links = this.props.feedQuery.feed.links;

    return <div>{links.map(link => <Link key={link.id} link={link} />)}</div>;
  }
}

const FEED_QUERY = gql`
  query FeedQuery {
    feed {
      links {
        id
        url
        description
        createdAt
      }
    }
  }
`;

export default graphql(FEED_QUERY, { name: 'feedQuery' })(LinkList);

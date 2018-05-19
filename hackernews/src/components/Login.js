import React, { Component } from 'react'
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'

let REGISTER_MUTATION = gql`
  mutation RegisterMutation(
    $name: String!
    $email: String!
    $password: String!
  ) {
    signup(name: $name, email: $email, password: $password) {
      user {
        id
      }
    }
  }
`

let LOGIN_MUTATION = gql`
  mutation LoginMutation($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      refreshToken
    }
  }
`

class Login extends Component {
  state = {
    login: true,
    email: '',
    password: '',
    name: ''
  }

  render() {
    return (
      <div className="w-full">
        <h2 className="mb-4">{this.state.login ? 'login' : 'sign up'}</h2>
        <form>
          {!this.state.login && (
            <div className="mb-6">
              <label
                className="block text-grey-darker text-sm font-bold mb-2"
                htmlFor="name"
              >
                name
              </label>

              <input
                className="appearance-none border rounded w-full py-2 px-3 text-grey-darker"
                id="name"
                type="text"
                value={this.state.name}
                onChange={(e) => this.setState({ name: e.target.value })}
              />
            </div>
          )}
          <div className="mb-6">
            <label
              className="block text-grey-darker text-sm font-bold mb-2"
              htmlFor="email"
            >
              e-mail address
            </label>
            <input
              className="appearance-none border rounded w-full py-2 px-3 text-grey-darker"
              id="email"
              type="email"
              placeholder="foo@example.com"
              value={this.state.email}
              onChange={(e) => this.setState({ email: e.target.value })}
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-grey-darker text-sm font-bold mb-2"
              htmlFor="password"
            >
              password
            </label>
            <input
              className="appearance-none border rounded w-full py-2 px-3 text-grey-darker"
              id="password"
              type="password"
              value={this.state.password}
              onChange={(e) => this.setState({ password: e.target.value })}
            />
          </div>
          <div className="md:flex md:items-center">
            <div className="md:w-1/3" />
            <div className="md:w-2/3">
              <button
                className="bg-purple hover:bg-purple-light text-white py-2 px-4 rounded mb-2 mr-2"
                type="button"
                onClick={() => this._confirm()}
              >
                {this.state.login ? 'login' : 'create account'}
              </button>
              <button
                className="bg-transparent hover:bg-blue text-blue-dark hover:text-white py-2 px-4 border border-blue hover:border-transparent rounded"
                type="button"
                onClick={() => this.setState({ login: !this.state.login })}
              >
                {this.state.login
                  ? 'need to create an account?'
                  : 'already have an account?'}
              </button>
            </div>
          </div>
        </form>
      </div>
    )
  }

  _confirm = async () => {
    let { name, email, password } = this.state

    if (this.state.login) {
      let response = await this.props.loginMutation({
        variables: {
          email,
          password
        }
      })
      this._saveUserData(response)
    } else {
      await this.props.registerMutation({
        variables: {
          name,
          email,
          password
        }
      })
    }

    this.props.history.push('/')
  }

  _saveUserData = (response) => {
    let { token, refreshToken } = response.data.login

    this.props.storeUserData(token, refreshToken)
  }
}

export default compose(
  graphql(REGISTER_MUTATION, { name: 'registerMutation' }),
  graphql(LOGIN_MUTATION, { name: 'loginMutation' })
)(Login)

import * as types from '../constants/ActionTypes'

const initialState = {
  token: null,
  refreshToken: null,
  authenticated: false
}

export default function authenticate(state = initialState, action) {
  switch (action.type) {
    case types.LOGIN:
      return Object.assign({}, state, {
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        authenticated: true
      })
    case types.LOGOUT:
      return Object.assign({}, state, initialState)
    default:
      return state
  }
}

import * as types from '../constants/ActionTypes'

export function login(token, refreshToken) {
  return {
    type: types.LOGIN,
    payload: {
      token,
      refreshToken
    }
  }
}

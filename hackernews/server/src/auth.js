import jwt from 'jsonwebtoken'
import _pick from 'lodash/pick'

class Auth {
  /**
   * Create new access token and refresh token pair.
   *
   * @param {object} user
   * @param {string} secret
   * @returns {Promise<[any]>}
   */
  static async createTokens(user, secret) {
    let tokenPayload = { user: _pick(user, ['id', 'name', 'email']) }
    let createToken = jwt.sign(tokenPayload, secret, { expiresIn: '1d' })

    let refreshTokenPayload = { user: _pick(user, 'id') }
    let createRefreshToken = jwt.sign(refreshTokenPayload, secret, { expiresIn: '7d' })

    return Promise.all([createToken, createRefreshToken])
  }

  /**
   * Refresh tokens for a given user.
   *
   * @param {string} token
   * @param {string} refreshToken
   * @param {Prisma} db
   * @param {string} secret
   * @returns {Promise<*>}
   */
  static async refreshTokens(token, refreshToken, db, secret) {
    let userId = null

    try {
      let { user: { id } } = jwt.decode(refreshToken)
      userId = id
    } catch (err) {
      return {}
    }

    if (!userId) {
      return {}
    }

    let user = await db.query.user({
      where: {
        id: userId
      }
    })

    if (!user) {
      return {}
    }

    try {
      jwt.verify(refreshToken, secret)
    } catch (err) {
      return {}
    }

    let [newToken, newRefreshToken] = await Auth.createTokens(user, secret)

    return {
      user,
      token: newToken,
      refreshToken: newRefreshToken
    }
  }
}

export default Auth

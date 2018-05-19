import bcrypt from 'bcryptjs'

import Auth from '../auth'
import Server from '../server'
import { authRequired, getAuthUserId } from '../permissions'
import ms from 'ms'

async function register(parent, args, context) {
  let password = await bcrypt.hash(args.password, 10)

  let user = await context.db.mutation.createUser({
    data: { ...args, password }
  })

  return {
    user
  }
}

async function login(parent, args, { response, db }) {
  let user = await db.query.user({
    where: {
      email: args.email
    }
  }, `{ id password }`)

  if (!user) {
    throw new Error('User not found')
  }

  let valid = await bcrypt.compare(args.password, user.password)
  if (!valid) {
    throw new Error('Invalid password')
  }

  let [token, refreshToken] = await Auth.createTokens(user, process.env.APP_SECRET);

  response.cookie('token', token, {
    maxAge: ms('1d'),
    httpOnly: true,
    secure: Server.inProduction()
  })

  response.cookie('refresh-token', refreshToken, {
    maxAge: ms('7d'),
    httpOnly: true,
    secure: Server.inProduction()
  })

  return {
    user,
    token,
    refreshToken
  }
}

let storeLink = authRequired.createResolver((parent, args, context, info) => {
  let userId = getAuthUserId(context)
  return context.db.mutation.createLink({
    data: {
      url: args.url,
      description: args.description,
      postedBy: { connect: { id: userId } }
    }
  }, info)
})

function updateLink(parent, args, context, info) {
  return context.db.mutation.updateLink({
    data: {
      url: args.url,
      description: args.description
    },

    where: {
      id: args.id
    }
  }, info)
}

function deleteLink(parent, args, context, info) {
  return context.db.mutation.deleteLink({
    where: {
      id: args.id
    }
  }, info)
}

async function vote(parent, args, context, info) {
  let userId = getAuthUserId(context)
  let alreadyVoted = await context.db.exists.Vote({
    user: { id: userId },
    link: { id: args.linkId }
  })

  if (alreadyVoted) {
    throw new Error(`Already voted for link ${args.linkId}`)
  }

  return context.db.mutation.createVote({
    data: {
      user: { connect: { id: userId } },
      link: { connect: { id: args.linkId } }
    }
  }, info)
}

export default {
  register,
  login,
  storeLink,
  updateLink,
  deleteLink,
  vote
}

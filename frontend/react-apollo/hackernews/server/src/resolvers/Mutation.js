import { hash, compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { getUserId } from '../utils'
import { APP_SECRET } from '../constants'

async function signup(parent, args, context, info) {
    let password = await hash(args.password, 10)
    let user = await context.db.mutation.createUser({
        data: { ...args, password },
    }, `{ id }`)

    let token = sign({ userId: user.id }, APP_SECRET)

    return {
        token,
        user,
    }
}

async function login(parent, args, context, info) {
    let user = await context.db.query.user({
        where: {
            email: args.email
        }
    }, `{ id password }`)
    if (!user) {
        throw new Error('User not found')
    }

    let valid = await compare(args.password, user.password)
    if (!valid) {
        throw new Error('Invalid password')
    }

    let token = sign({ userId: user.id }, APP_SECRET)

    return {
        token,
        user,
    }
}

function storeLink(parent, args, context, info) {
    let userId = getUserId(context)
    return context.db.mutation.createLink({
        data: {
            url: args.url,
            description: args.description,
            postedBy: { connect: { id: userId } },
        }
    }, info)
}

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
    let userId = getUserId(context)
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
    signup,
    login,
    storeLink,
    updateLink,
    deleteLink,
    vote,
}

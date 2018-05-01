const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../utils')

async function signup(parent, args, context, info) {
    const password = await bcrypt.hash(args.password, 10)
    const user = await context.db.mutation.createUser({
        data: { ...args, password },
    }, `{ id }`)

    const token = jwt.sign({ userId: user.id }, APP_SECRET)

    return {
        token,
        user,
    }
}

async function login(parent, args, context, info) {
    const user = await context.db.query.user({
        where: {
            email: args.email
        }
    }, `{ id password }`)
    if (!user) {
        throw new Error('User not found')
    }

    const valid = await bcrypt.compare(args.password, user.password)
    if (!valid) {
        throw new Error('Invalid password')
    }

    const token = jwt.sign({ userId: user.id }, APP_SECRET)

    return {
        token,
        user,
    }
}

function storeLink(root, args, context, info) {
    const userId = getUserId(context)
    return context.db.mutation.createLink({
        data: {
            url: args.url,
            description: args.description,
            postedBy: { connect: { id: userId } },
        }
    }, info)
}

function updateLink(root, args, context, info) {
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

function deleteLink(root, args, context, info) {
    return context.db.mutation.deleteLink({
        where: {
            id: args.id
        }
    }, info)
}

module.exports = {
    signup,
    login,
    storeLink,
    updateLink,
    deleteLink,
}

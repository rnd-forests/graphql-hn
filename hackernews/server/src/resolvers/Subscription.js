function newLinkSubscribe(parent, args, context, info) {
  return context.db.subscription.link({
    // https://github.com/graphcool/prisma/issues/1734
    // where: { mutation_in: ['CREATED'] },
  }, info)
}

// Subscription resolvers are wrapped inside an object
// and need to be provided as the value for a subscribe field
const newLink = {
  subscribe: newLinkSubscribe
}

function newVoteSubscribe(parent, args, context, info) {
  return context.db.subscription.vote({
    // https://github.com/graphcool/prisma/issues/1734
    // where: { mutation_in: ['CREATED'] },
  }, info)
}

const newVote = {
  subscribe: newVoteSubscribe
}

export default {
  newLink,
  newVote,
}

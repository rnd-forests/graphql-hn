function feed(parent, args, context, info) {
    let where = {}
    let filter = args.filter
    if (filter) {
        where = {
            OR: [
                { url_contains: args.filter },
                { description_contains: args.filter },
            ],
        }
    }

    return context.db.query.links({
        where,
        skip: args.skip,
        first: args.first,
        orderBy: args.orderBy,
    }, info)
}

export default {
    feed,
}

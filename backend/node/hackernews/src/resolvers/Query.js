async function feed(parent, args, context, info) {
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

    // Get the list of all link IDs according to
    // the given filtering conditions.
    let queriedLinks = await context.db.query.links({
        where,
        skip: args.skip,
        first: args.first,
        orderBy: args.orderBy,
    }, `{ id }`)

    let countSelectionSet = `
        {
            aggregate {
                count
            }
        }
    `

    // Query the total number of links currently stored in the database
    let linksConnection = await context.db.query.linksConnection({}, countSelectionSet)

    return {
        count: linksConnection.aggregate.count,
        linkIds: queriedLinks.map(link => link.id),
    }
}

export default {
    feed,
}

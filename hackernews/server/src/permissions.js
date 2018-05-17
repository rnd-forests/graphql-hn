let createResolver = (resolver) => {
  let base = resolver;

  base.createResolver = (child) => {
    let newResolver = async (parent, args, context, info) => {
      await resolver(parent, args, context, info);

      return child(parent, args, context, info);
    };

    return createResolver(newResolver);
  };

  return base;
};

export const authRequired = createResolver((parent, args, context) => {
  if (!context.request.user || !context.request.user.id) {
    throw new Error('Unauthenticated')
  }
})

export function getAuthUserId(context) {
  if (!context.request.user || !context.request.user.id) {
    throw new Error('Unauthenticated')
  }

  return context.request.user.id
}

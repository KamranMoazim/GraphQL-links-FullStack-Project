async function feed(parent, args, context, info) {
    return await context.prisma.link.findMany()
}
  

// feed: async (parent, args, context) => {
//     return await context.prisma.link.findMany()
// }


module.exports = {
    feed,
}
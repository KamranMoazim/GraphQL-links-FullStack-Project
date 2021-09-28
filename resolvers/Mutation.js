const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET } = require('../utils')

async function signup(parent, args, context, info) {
    // 1
    const password = await bcrypt.hash(args.password, 10)
  
    // 2
    const user = await context.prisma.user.create({ data: { ...args, password } })
  
    // 3
    const token = jwt.sign({ userId: user.id }, APP_SECRET)
  
    // 4
    return {
      token,
      user,
    }
}
  
async function login(parent, args, context, info) {
    // 1
    const user = await context.prisma.user.findUnique({ where: { email: args.email } })
    if (!user) {
      throw new Error('No such user found')
    }
  
    // 2
    const valid = await bcrypt.compare(args.password, user.password)
    if (!valid) {
      throw new Error('Invalid password')
    }
  
    const token = jwt.sign({ userId: user.id }, APP_SECRET)
  
    // 3
    return {
      token,
      user,
    }
}
  

async function post(parent, args, context, info) {
    const { userId } = context;
  
    const newLink = await context.prisma.link.create({
      data: {
        url: args.url,
        description: args.description,
        postedBy: { connect: { id: userId } },
      }
    })

    context.pubsub.publish("NEW_LINK", newLink)

    return newLink
}


// updateLink: async (parent, args, cntx)=>{
//     console.log("UPDATE")
//     const updateLink = await cntx.prisma.link.update({
//         where: {
//             id: parseInt(args.id)
//         },
//         data: {
//             description: args.description,
//             url: args.url
//         },
//     })
//     // console.log(updateLink)
//     return updateLink
// },
async function updatePost(parent, args, context, info) {
    // const { userId } = context;
  
    return await context.prisma.link.update({
        where: {
            id: parseInt(args.id)
        },
        data: {
            url: args.url,
            description: args.description,
            // postedBy: { connect: { id: userId } },
        }
    })
}


// deleteLink: async (parent, args, cntx)=>{
//     const deletedLink = await cntx.prisma.link.delete({
//         where: {
//             id: parseInt(args.id)
//         }
//     })
//     // console.log(deletedLink)
//     return args.id
// },
async function deletePost(parent, args, context, info) {
    await context.prisma.link.delete({
        where: {
            id: parseInt(args.id)
        }
    })
    context.pubsub.publish("DELETE_LINK", args.id);    

    return args.id
}


async function vote(parent, args, context, info) {
    const { userId } = context;

    const vote = await context.prisma.vote.findUnique({
      where: {
        linkId_userId: {
          linkId: Number(args.linkId),
          userId: userId
        }
      }
    })

    if (Boolean(vote)) {
      throw new Error(`Already voted for link: ${args.linkId}`)
    }

    const newVote = context.prisma.vote.create({
      data: {
        user: { connect: { id: userId } },
        link: { connect: { id: Number(args.linkId) } },
      }
    })
    
    context.pubsub.publish("NEW_VOTE", newVote)

    return newVote
}


module.exports = {
    signup,
    login,
    post,
    updatePost,
    deletePost,
    vote
}



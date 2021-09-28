// const { ApolloServer } = require('apollo-server');
// const { PrismaClient } = require('@prisma/client');


// const prisma = new PrismaClient();


// let users = [];
// let links = [];


// const typeDefs = `
// type User {
//     id: ID!
//     name: String!
//     email: String!
//     links: [Link!]!
// }
// type Link {
//     id: ID!
//     description: String!
//     url: String!
//     postedBy: User
// }
// type AuthPayload {
//     token: String
//     user: User
// }

// type Query {
//     info: String!
//     feed: [Link!]!
//     link(id: ID!): Link
//     users: [User!]!
//     user(id: ID!): User
// }

// type Mutation {
//     post(url: String!, description: String!): Link!
//     updateLink(id: ID!, url: String, description: String): Link
//     deleteLink(id: ID!): ID
//     signup(email: String!, password: String!, name: String!): AuthPayload
//     login(email: String!, password: String!): AuthPayload
//     createUser(name: String!): User!
// }
// `

// // 2
// const resolvers = {
//   Query: {
//     info: ()=> "A simple info String returning",
//     // feed:()=>links,
//     feed: async (parent, args, context) => {
//         return await context.prisma.link.findMany()
//     },
//     users: () => users,
//     user: (parent, args, cntx)=>{
//         let ind = users.indexOf((user)=>{
//             return user.id === args.id
//         })
//         return users[ind]
//     },
//     link: (parent, args, cntx)=>{
//         let ind = links.indexOf((link)=>{
//             return link.id === args.id
//         })
//         return links[ind]
//     }
//   },
//   Mutation: {
//     // post: (parent, args, cntx)=>{
//     //     let post = {id: links.length+1, url: args.url, description: args.description};
//     //     links.push(post)
//     //     return post;
//     // },
//     post: async (parent, args, context, info) => {
//         const newLink = await context.prisma.link.create({
//             data: {
//                 url: args.url,
//                 description: args.description,
//             },
//         })
//         console.log(newLink)
//         return newLink
//     },
//     // updateLink:(parent, args, cntx)=>{
//     //     let ind = links.indexOf((link)=>{
//     //         return link.id === args.id
//     //     })
//     //     links[ind] = {...args}
//     //     return links[ind]
//     // },
//     updateLink: async (parent, args, cntx)=>{
//         console.log("UPDATE")
//         const updateLink = await cntx.prisma.link.update({
//             where: {
//                 id: parseInt(args.id)
//             },
//             data: {
//                 description: args.description,
//                 url: args.url
//             },
//         })
//         // console.log(updateLink)
//         return updateLink
//     },
//     // deleteLink:(parent, args, cntx)=>{
//     //     let ind = links.indexOf((link)=>{
//     //         return link.id === args.id
//     //     }) 

//     //     links.splice(ind, 1)

//     //     return args.id;
//     // },
//     deleteLink: async (parent, args, cntx)=>{
//         const deletedLink = await cntx.prisma.link.delete({
//             where: {
//                 id: parseInt(args.id)
//             }
//         })
//         // console.log(deletedLink)
//         return args.id
//     },
//     createUser: (parent, args, cntx) => {
//         let user = {id:users.length+1, name: args.name};
//         users.push(user)
//         return user;
//     }
//   },
//   Link: {
//     id: (parent) => parent.id,
//     description: (parent) => parent.description,
//     url: (parent) => parent.url,
//   }
// }




// const server = new ApolloServer({
//   typeDefs,
//   resolvers,
//   context: {
//     prisma,
//   }
// })

// server
//     .listen()
//     .then(({ url }) =>
//         console.log(`Server is running on ${url}`)
//     );


const { ApolloServer, PubSub } = require('apollo-server');
// const {ApolloServer} = require("apollo-server-express");
const { PrismaClient } = require('@prisma/client');
const fs = require("fs");
const path = require("path");

const { getUserId } = require('./utils');

const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutation')
const User = require('./resolvers/User')
const Link = require('./resolvers/Link')

const prisma = new PrismaClient();

const pubsub = new PubSub()

const resolvers = {
    Query,
    Mutation,
    User,
    Link
}

const server = new ApolloServer({
  typeDefs: fs.readFileSync(
    path.join(__dirname, 'schema.graphql'),
    'utf8'
  ),
  resolvers,
  context: ({ req }) => {
    return {
      ...req,
      prisma,
      pubsub,
      userId: req && req.headers.authorization ? getUserId(req) : null
    };
  }
});

server
    .listen()
    .then(({ url }) =>
        console.log(`Server is running on ${url}`)
    );

// 1
const { PrismaClient } = require("@prisma/client")

// 2
const prisma = new PrismaClient()

// 3
async function main() {
//   const allLinks = await prisma.link.findMany();

//   const newLink = await prisma.link.create({
//     data: {
//       description: 'Fullstack tutorial for GraphQL',
//       url: 'www.howtographql.com',
//     },
//   });

  try {
    const updateLink = await prisma.link.update({
        where: {
            id: 13
        },
        data: {
            description:"gdfgdf",
            url:"Fsdfdfs"
        },
    })

    console.log(updateLink)
    
  } catch (error) {
      console.log(error)
  }


//   const deletedLink = await prisma.link.delete({
//       where: {
//           id:12
//       }
//   })

//   console.log(allLinks)
//   console.log(newLink)
//   console.log(deletedLink)
}

// 4
main()
  .catch(e => {
    throw e
})
  // 5
  .finally(async () => {
    await prisma.$disconnect()
})
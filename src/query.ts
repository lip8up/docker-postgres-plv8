import prismaClient from '@prisma/client'
import './dev'

const { PrismaClient } = prismaClient

const prisma = new PrismaClient()

// const newUser = await prisma.user.create({
//   data: {
//     name: 'lip8up',
//     email: 'lip8up@qq.com',
//   },
// })

// const users = await prisma.user.findMany()
// console.log(users)

// const postNum = await prisma.post.createMany({
//   data: [
//     { title: 'post1', content: 'content1', authorId: 1 },
//     { title: 'post2', content: 'content2', authorId: 1 },
//   ]
// })

// console.log(postNum)

// const user = await prisma.user.update({
//   where: { id: 1 },
//   data: {
//     name: 'NEW USER'
//   }
// })
// console.log(user)

const user = await prisma.user.findMany({
  include: { posts: true }
})
console.log(user)

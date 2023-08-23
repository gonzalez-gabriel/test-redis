import express from 'express'
import responseTime from 'response-time'

import { PrismaClient } from '@prisma/client'
import { redis } from './redis.js'

const prisma = new PrismaClient()

const app = express()
app.use(responseTime())

app.get('/', async (_req, res) => {

  // const cachedValue = await redis.get('users')
  // if(cachedValue) {
  //   console.log('Fetching from cache')
  //   return res.json(JSON.parse(cachedValue))
  // }

  const users = await prisma.users.findMany({
    include: {
      posts: true,
      profile: true,
    },
  })

  console.log('Fetching from DB')
  await redis.set('users', JSON.stringify(users))
  // await redis.rpush('comments', JSON.stringify(users))
  res.json(users)
})

app.post('/', async (req, res) => {
  const user =  await prisma.users.create({
    data: {
      name: 'Alice',
      email: 'alice@prisma.io',
      posts: {
        create: { title: 'Hello World' },
      },
      profile: {
        create: { bio: 'I like turtles' },
      },
    },
  })

  const allUsers = await prisma.users.findMany({
    include: {
      posts: true,
      profile: true,
    },
  })
  console.log(allUsers)
  res.status(200).json(user)
})

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})
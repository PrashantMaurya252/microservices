require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const Redis = require('ioredis')
const cors = require('cors')
const helmet = require('helmet')
const postRoutes = require('./routes/post-routes')
const errorHandler = require('./middlewares/errorHandler')
const logger = require('./utils/logger')
const connectDB = require('./utils/connectToDB')

const app = express()
const PORT = process.env.PORT || 3002

connectDB()

const redisClient = new Redis(process.env.REDIS_URL)

app.use(helmet());
app.use(cors())

app.use(express.json())
app.use((req,res,next)=>{
    logger.info(`Received ${req.method} request to ${req.url}`)
    logger.info(`Request body ${req.body} `)
    next()
});


// task  implement ip based rate limiting

// routes  pass redis client to routes
app.use('/api/posts',(req,res,next)=>{
    req.redisClient = redisClient
    next()
},postRoutes)

app.listen(PORT,()=>{
    logger.info(`Identity service running on port ${PORT}`)
 });

 // unhandler promise rejection

 process.on('unhandledRejection',(reason,promise)=>{
    logger.error("Unhandled Rejection at", promise,"reason:",reason)
 })

app.use(errorHandler)
require('dotenv').config()
const connectDB = require('./utils/connectToDB')
const logger = require('./utils/logger')
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const {RateLimiterRedis} = require('rate-limiter-flexible')
const Redis = require('ioredis')

const app = express()

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

 // DDos protection and rate limiting

 const rateLimiter = new RateLimiterRedis({
    storeClient:redisClient,
    keyPrefix: 'middleware',
    points:10,
    duration:1
 })

 app.use((req,res,next)=>{
    rateLimiter.consume(req.ip).then(()=>next()).catch((e)=>{
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({success:false,message:"Too many requests"})
     })
 })



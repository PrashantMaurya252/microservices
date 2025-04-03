require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const Redis = require('ioredis')
const cors = require('cors')
const helmet = require('helmet')
const errorHandler = require('./middlewares/errorHandler')
const logger = require('./utils/logger')
const mediaRoutes = require('./routes/media-routes')
const connectDB = require('./utils/connectToDB')
const { connectRabbitMQ, consumeEvent } = require('./utils/rabbitmq')
const { handlePostDeleted } = require('./eventHandlers/media-event-handlers')

const app = express()
const PORT =process.env.PORT || 3003

connectDB()

app.use(cors())
app.use(helmet())
app.use(express.json())

app.use((req,res,next)=>{
    logger.info(`Received ${req.method} request to ${req.url}`)
    logger.info(`Request body,${req.body}`)
    next()
})

// Ip based rate limiting for sensitive endpoints(not done) like identity service

app.use('/api/media',mediaRoutes)
app.use(errorHandler)

async function startServer(){
    try {
        await connectRabbitMQ()
        logger.info("connected to rabbit mq")

        // consume all-event

        await consumeEvent('post.deleted',handlePostDeleted)
        app.listen(PORT,()=>{
            logger.info(`Media service running on port ${PORT}`)
         });
    } catch (error) {
        logger.error('Failed to connect to server',error)
        process.exit(1)
    }
}

// app.listen(PORT,()=>{
//     logger.info(`media service running on PORT ${PORT}`)
// })
startServer()

process.on("unhandledRejection",(reason,promise)=>{
    logger.error("Unhandled Rejection at",promise,"reson:",reason)
})
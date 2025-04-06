require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const Redis = require('ioredis')
const cors = require('cors')
const helmet = require('helmet')

const errorHandler = require('./middlewares/errorHandler')
const logger = require('./utils/logger')
const searchRoutes = require('./routes/searchRoutes')

const {connectRabbitMQ,consumeEvent} = require('./utils/rabbitmq')
const connectDB = require('./utils/connectToDB')
const { handlePostCreated, handlePostDeleted } = require('./eventHandlers/search-event-handlers')

const app = express()
const PORT = process.env.PORT || 3004

connectDB()

app.use(cors())
app.use(helmet())
app.use(express.json())

app.use((req,res,next)=>{
    logger.info(`Received ${req.method} request to ${req.url}`)
    logger.info(`Request body,${req.body}`)
    next()
})

app.use('/api/search',searchRoutes)

app.use(errorHandler)
async function startServer(){
    try {
        await connectRabbitMQ();
        await consumeEvent('post.created',handlePostCreated)
        await consumeEvent('post.deleted',handlePostDeleted)
        app.listen(PORT,()=>{
            logger.info(`Search service is running on PORT ${PORT}`)
        })
    } catch (error) {
        logger.error(error,"Failed to start search service")
        process.exit(1)
    }
}

startServer()
const amqp = require('amqplib');
const logger = require('./logger')

const connection = null;
const channel = null;

const EXCHANGE_NAME = 'facebook_events'

async function connectRabbitMQ(){
    try {
        const connection = await amqp.connect(process.env.RABBIT_URL);
        const channel = await connection.createChannel();

        await channel.assertExchange(EXCHANGE_NAME,"topic",{durable:false});
        logger.info("Connected to rabbitmq");
        return channel
    } catch (error) {
        logger.error('Error connecting to rabbitmq',error)
    }
}

module.exports = {connectRabbitMQ}
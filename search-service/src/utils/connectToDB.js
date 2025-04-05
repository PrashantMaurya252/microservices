const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async() => {
  await mongoose
    .connect(process.env.MONGO_URI)
    .then(() => logger.info("Connected to mongoDB"))
    .catch((e) => logger.error("Mongo connection error", e));
};


module.exports = connectDB
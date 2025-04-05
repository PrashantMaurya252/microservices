const Search = require("../models/search")
const logger = require("../utils/logger")

const searchPostController  = async(req,res)=>{
    logger.info('Search endpoints hit!')
    try {
        const {query} = req.query
        const results = await Search.find({
            $text:{$search:query}
        },{
            score:{$meta:"textScore"},
        }).sort({score:{$meta:"textScore"}})
        .limit(10)

        res.json(results)
    } catch (error) {
        logger.error("Error while Searching post", error);
        res.status(500).json({
          success: false,
          message: "Error while Searching post",
        });
      }
}

module.exports = {searchPostController}
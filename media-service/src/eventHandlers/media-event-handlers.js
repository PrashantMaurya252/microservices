const Media = require("../models/Media")
const { deleteMediaFromCloudinary } = require("../utils/cloudinary")

const handlePostDeleted = async(event)=>{
    console.log(event,"eventeventevent")
    const {postId,mediaIds} = event

    try {
        const mediaToDelete = await Media.find({_id:{$in:mediaIds}})
        for(const media of mediaToDelete){
            await deleteMediaFromCloudinary(media.publicId)
            await Media.findByIdAndDelete(media._id)

            logger.info(`Delete media ${media._id} associated with this deleted post ${postId}`)
            logger.info(`Processed deletion of media for post id ${postId}`)
        }
    } catch (error) {
        logger.error(error,"Error occured while media deletion")
    }
}

module.exports = {handlePostDeleted}
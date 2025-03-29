const Post = require('../models/Post')
const logger = require('../utils/logger')
const { validateCreatePost } = require('../utils/validation')

const createPost = async(req,res)=>{
    logger.info("Create Post endpoint hit")
    try {

        const {error} = validateCreatePost(req.body)
                if(error){
                    logger.warn('Validation error',error.details[0].message)
                    return res.status(400).json({
                        success:false,
                        message:error.details[0].message
                    })
                }
        const {content,mediaIds} = req.body
        const newelyCretedPost = new Post({
            user:req.user.userId,
            content,
            mediaIds:mediaIds || []
        })

        await newelyCretedPost.save()
        logger.info('Post created successfully',newelyCretedPost)
        res.status(201).json({
            success:true,
            message:'Post created successfully'
        })
    } catch (error) {
        logger.error('Error creating post',error)
        res.status(500).json({
            success:false,
            message:"Error creating post",
        })
    }
}

const getAllPosts = async(req,res)=>{
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10
        const startIndex = (page - 1)*limit;

        const cacheKey = `posts:${page}:${limit}`;
        const cachedPosts = await req.redisClient.get(cacheKey);

        if(cachedPosts){
            return res.json(JSON.parse(cachedPosts))

        }

        const posts = await Post.find({}).sort({createdAt:-1}).skip(startIndex).limit(limit)
        const totalNumberOfPosts = await Post.countDocuments()

        const result = {
            posts,
            currentPage:page,
            totalPages:Math.ceil(totalNumberOfPosts/limit),
            totalPosts:totalNumberOfPosts
        }

        // save your posts in redis cache

        await req.redisClient.setex(cacheKey,300,JSON.stringify(result))

        res.json(result)
    } catch (error) {
        logger.error('Error fetching posts',error)
        res.status(500).json({
            success:false,
            message:"Error getting posts",
        })
    }
}

const getPost = async(req,res)=>{
    try {
        
    } catch (error) {
        logger.error('Error fetching post',error)
        res.status(500).json({
            success:false,
            message:"Error getting post",
        })
    }
}

const deletePost = async(req,res)=>{
    try {
        
    } catch (error) {
        logger.error('Error deleting post',error)
        res.status(500).json({
            success:false,
            message:"Error deleting post",
        })
    }
}

module.exports = {createPost,getAllPosts}
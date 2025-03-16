const logger = require('../utils/logger')
const {validateRegistration, validateLogin} = require('../utils/validation')
const User = require("../models/user")
const generateToken = require('../utils/generateTokens')
const RefreshToken = require('../models/RefreshToken')


// user registration

const registerUser = async(req,res)=>{
    logger.info('Registration endpoint hit...')
    try {

        // validate schema
        const {error} = validateRegistration(req.body)
        if(error){
            logger.warn('Validation error',error.details[0].message)
            return res.status(400).json({
                success:false,
                message:error.details[0].message
            })
        }

        const {email,username,password} = req.body

        let user = await User.findOne({$or:[{email},{username}]})
        if(user){
            logger.warn('User already exist')
            return res.status(400).json({
                success:false,
                message:"User already exists"
            })
        }

        user = new User({username,email,password})
        logger.warn("User saved successfully",user._id);
        await user.save()

        const {accessToken,refreshToken} = await generateToken(user)

        res.status(201).json({
            success:true,
            message:'User registered successfully',
            accessToken,refreshToken
        })
    } catch (e) {
        logger,error('Registration error occured',e)
        res.status(500).json({
            success:false,
            message:'Internal Server Error'
        })
    }
}


// user login

const loginUser = async(req,res)=>{
    logger.info("Login endpoint hit...")
    try {
        const {error} = validateLogin(req.body)
        if(error){
            logger.warn('Validation error',error.details[0].message)
            return res.status(400).json({
                success:false,
                message:error.details[0].message
            })
        }

        const {email,password} = req.body;
        const user = await User.findOne({email})

        if(!user){
            logger.warn('Invalid User')
            return res.status(400).json({
                success:false,
                message:'Invalid Credentials'
            })
        }

        // valid password
        const isValidPassword = await user.comparePassword(password);

        if(!isValidPassword){
            logger.warn('Invalid Password')
            return res.status(400).json({
                success:false,
                message:'Invalid Password'
            })
        }

        const {accessToken,refreshToken} = await generateToken(user)

        res.json({
            accessToken,
            refreshToken,
            userId:user._id
        })
    } catch (e) {
        logger.error("Login error occured",e)
        res.status(500).json({
            success:false,
            message:"Internal Server Error"
        }) 
    }
}


// refresh token

const refreshTokenUser = async(req,res)=>{
    logger.info("Refresh token endpoint hit...")
    try {
        const {refreshToken} = req.body
        if(!refreshToken){
            logger.warn("Refresh Token missing")
            return res.status(400).json({
                success:false,
                message:"Refresh Token Missing"
            })
        }

        const storedToken = await RefreshToken.findOne({token:refreshToken})

        if(!storedToken || storedToken.expiresAt < new Date()){
            logger.warn('Invalid or expired refresh token')

            return res.status(401).json({
                success:false,
                message:'Invalid or expired refresh token'
            })
        }

        const user = await User.findById(storedToken.user)

        if(!user){
            logger.warn('User not found')

            return res.status(401).json({
                success:false,
                message:'User not found'
            })
        }

        const {accessToken:newAccessToken,refreshToken:newRefreshToken} = await generateToken(user)

        // delete the old refreshToken

        await RefreshToken.deleteOne({_id:storedToken._id})

        res.json({
            accessToken:newAccessToken,
            refreshToken:newRefreshToken
        })
    } catch (e) {
        logger.error("refresh token error occured",e)
        res.status(500).json({
            success:false,
            message:"Internal Server Error"
        }) 
    }
}


// logout

const logout = async(req,res)=>{
    logger.info('Logout endpoint hit...');

    try {
        const {refreshToken} = req.body
        if(!refreshToken){
            logger.warn("Refresh Token missing")
            return res.status(400).json({
                success:false,
                message:"Refresh Token Missing"
            })
        }

        await RefreshToken.deleteOne({token:refreshToken})
        logger.info('Refresh token deleted for logout')

        res.json({
            success:true,
            message:'Loged out successfully!'
        })
    } catch (error) {
        logger.error("Error while logout",e)
        res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}


module.exports = {registerUser,loginUser,refreshTokenUser,logout}
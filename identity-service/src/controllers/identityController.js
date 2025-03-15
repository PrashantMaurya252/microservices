const logger = require('../utils/logger')
const {validateRegistration} = require('../utils/validation')
const User = require("../models/user")


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
        await user.save()
    } catch (e) {
        logger.warn("User saved successfully",user._id);
    }
}


// user login


// refresh token


// logout
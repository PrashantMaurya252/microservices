const mongoose = require('mongoose');
const argon2 = require('argon2')

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true
    },
    createAt:{
        type:Date,
        default:Date.now
    }
},{timestamps:true})

userSchema.pre('save',async function(next){
    if(this.isModified('password')){
        try {
            this.password = await argon2.hash(this.password)
        } catch (error) {
            console.log(error,"Password save error")
            return next(error)
        }
    }
})
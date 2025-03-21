const express = require('express')
const {createPost} = require('../controllers/post-controller')
const {authenticateRequest}= require('../middlewares/authMiddleware')


const router = express()

// middleware  -> this will tell if the user is an auth user or not

router.use(authenticateRequest)

router.post('/create-post',createPost)

module.exports = router
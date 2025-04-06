const express = require('express')
const {searchPostController} = require('../controllers/searchController')

const {authenticateRequest} = require('../middlewares/authMiddleware')

const router = express.Router()

router.use(authenticateRequest)

router.get('/posts',searchPostController)

module.exports = router
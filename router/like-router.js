const express = require('express')
const router = express.Router()
const likeController = require('../controllers/like')

router.post('/add' , likeController.addLike)
router.post('/remove' , likeController.removeLike)

module.exports = router
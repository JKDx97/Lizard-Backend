const express = require('express')
const router = express.Router()
const postController = require('../controllers/post')
const multer = require('multer');
const storage = multer.memoryStorage(); 
const upload = multer({ storage });

router.post('/' , upload.single('photo'), postController.createPost)
router.get('/posts/:authorId', postController.getPostsByUser);
router.get('/random-posts', postController.getRandomPosts);

module.exports = router
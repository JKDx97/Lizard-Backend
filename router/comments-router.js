const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comments');

router.post('/comments', commentController.createComment); // Crear un comentario
router.get('/posts/:postId/comments', commentController.getCommentsByPost); // Obtener comentarios de un post

module.exports = router;
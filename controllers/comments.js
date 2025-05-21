// controllers/commentController.js
const Comment = require('../models/comments');
const Post = require('../models/post');

// Crear comentario y poblar autor + foto de perfil
exports.createComment = async (req, res) => {
  try {
    const { content, postId, userId } = req.body;

    const newComment = new Comment({
      content,
      author: userId,
      post: postId
    });

    await newComment.save();

    // Populate anidado para obtener username y foto de perfil
    await newComment.populate({
      path: 'author',
      select: 'username profile',
      populate: {
        path: 'profile',
        select: 'photo'
      }
    });

    // Añadir comentario al post
    await Post.findByIdAndUpdate(postId, { $push: { comments: newComment._id } });

    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error al crear el comentario', error);
    res.status(500).json({ message: 'Error al crear el comentario', error });
  }
};


exports.getCommentsByPost = async (req, res) => {
  const { postId } = req.params;

  try {
    const comments = await Comment.find({ post: postId })
      .populate({
        path: 'author',
        select: 'username profile',
        populate: {
          path: 'profile',
          select: 'photo'
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    console.error('Error al obtener los comentarios', error);
    res.status(500).json({ message: 'Error al obtener los comentarios', error });
  }
};

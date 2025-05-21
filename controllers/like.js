const Like = require('../models/like');
const Post = require('../models/post');

// Agregar "me gusta" a una publicación
const addLike = async (req, res) => {
  const { postId, userId } = req.body;

  try {
    const existingLike = await Like.findOne({ post: postId, user: userId });

    if (existingLike) {
      // Eliminar "me gusta"
      await Like.findByIdAndDelete(existingLike._id);
      await Post.findByIdAndUpdate(postId, { $pull: { likes: existingLike._id } });

      const likeCount = await Like.countDocuments({ post: postId });
      return res.status(200).json({ message: 'Me gusta eliminado', likeCount });
    } else {
      // Agregar "me gusta"
      const like = new Like({ post: postId, user: userId });
      await like.save();
      await Post.findByIdAndUpdate(postId, { $push: { likes: like._id } });

      const likeCount = await Like.countDocuments({ post: postId });
      return res.status(201).json({ message: 'Me gusta agregado', likeCount });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al alternar me gusta', error });
  }
};

// Eliminar "me gusta" de una publicación
const removeLike = async (req, res) => {
  const { postId, userId } = req.body;

  try {
    // Encuentra el "me gusta" existente
    const like = await Like.findOneAndDelete({ post: postId, user: userId });

    if (!like) {
      return res.status(400).json({ message: 'El "me gusta" no existe para este usuario y publicación.' });
    }

    // Elimina la referencia del "me gusta" en la lista de "me gusta" de la publicación
    await Post.findByIdAndUpdate(postId, { $pull: { likes: like._id } });

    res.status(200).json({ message: 'Me gusta eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar me gusta', error });
  }
};

module.exports = { addLike, removeLike };
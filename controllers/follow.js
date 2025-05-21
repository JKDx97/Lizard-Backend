// controllers/userController.js
const User = require('../models/user');
const Credential = require('../models/credential');

// Seguir a un usuario
const followUser = async (req, res) => {
  const { userId, targetUserId } = req.body;

  try {
    const user = await User.findOne({ credentials: userId });
    const targetUser = await User.findOne({ credentials: targetUserId });

    if (!user || !targetUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    await User.findByIdAndUpdate(user._id, { $addToSet: { following: targetUser._id } });
    await User.findByIdAndUpdate(targetUser._id, { $addToSet: { followers: user._id } });

    // Emitir evento de actualización de seguidores para ambos usuarios
    req.io.emit('followersUpdated', {
      follower: user._id,
      targetUser: targetUser._id
    });

    res.status(200).json({ message: "Seguiste al usuario con éxito" });
  } catch (error) {
    res.status(500).json({ message: "Error al seguir al usuario", error });
  }
};

// Dejar de seguir a un usuario
const unfollowUser = async (req, res) => {
  const { userId, targetUserId } = req.body;

  try {
    const user = await User.findOne({ credentials: userId });
    const targetUser = await User.findOne({ credentials: targetUserId });

    if (!user || !targetUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    await User.findByIdAndUpdate(user._id, { $pull: { following: targetUser._id } });
    await User.findByIdAndUpdate(targetUser._id, { $pull: { followers: user._id } });

    // Emitir evento de actualización de seguidores para ambos usuarios
    req.io.emit('followersUpdated', {
      unfollower: user._id,
      targetUser: targetUser._id
    });

    res.status(200).json({ message: "Has dejado de seguir al usuario" });
  } catch (error) {
    res.status(500).json({ message: "Error al dejar de seguir al usuario", error });
  }
};

// Obtener la lista de seguidores y seguidos de un usuario
const getFollowersAndFollowingByUserId = async (req, res) => {
  const userId = req.params.userId; // Obtener el ID de usuario desde los parámetros

  try {
      // Buscar al usuario usando el ID de la credencial
      const user = await User.findOne({ credentials: userId })
          .populate({
              path: 'following',
              populate: {
                  path: 'credentials',
                  select: '_id username profile',
                  populate: {
                    path: 'profile',
                    select: 'photo' // Solo la foto de perfil del following
                } // Solo obtener el ID de la credencial
              }
          })
          .populate('followers', 'name lastName');

      if (!user) {
          return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.status(200).json({
          followers: user.followers,
          following: user.following,
      });
  } catch (error) {
      res.status(500).json({ message: "Error al obtener seguidores y seguidos", error });
  }
};


module.exports = {
  followUser,
  unfollowUser,
  getFollowersAndFollowingByUserId
};

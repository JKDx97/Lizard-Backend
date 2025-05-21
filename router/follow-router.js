const express = require('express');
const router = express.Router();
const followController = require('../controllers/follow'); // Asegúrate de que el archivo se llame 'follow.js'

// Ruta para seguir a un usuario
router.post('/follow', followController.followUser);

// Ruta para dejar de seguir a un usuario
router.post('/unfollow', followController.unfollowUser);

router.get('/:userId/followers-following', followController.getFollowersAndFollowingByUserId);


module.exports = router;

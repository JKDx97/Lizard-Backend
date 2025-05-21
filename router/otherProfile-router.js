const express = require('express')
const router = express.Router()
const otherProfile = require('../controllers/otherProfile')


router.get('/user/username/:username/profile', otherProfile.getUserProfileByUsername)
router.get('/users', otherProfile.getAllUsers);

module.exports = router
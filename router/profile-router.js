const express = require('express')
const router = express.Router()
const profileController = require('../controllers/profile')
const multer = require('multer');
const storage = multer.memoryStorage(); 
const upload = multer({ storage });

router.post('/' , upload.single('photo'), profileController.uploadPhotoProfile)
router.get('/perfil/:userId' , profileController.getProfile)
module.exports = router
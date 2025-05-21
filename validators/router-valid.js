const express = require('express')
const router = express.Router()
const valid = require('./valid')
router.get('/checkUsername' , valid.checkUser )
router.get('/checkEmail' , valid.checkEmail)
module.exports = router
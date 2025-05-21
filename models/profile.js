const mongoose = require('mongoose')

const Schema = mongoose.Schema

const profile = new Schema({
    photo : {type : String},
    createAt : {type : Date , default : Date.now},
    user : {type: Schema.Types.ObjectId, ref: 'Credential', required: true}
})

module.exports = mongoose.model('Profile', profile);
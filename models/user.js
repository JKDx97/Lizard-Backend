const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: { type: String, required: true },
  lastName: { type: String, required: true },
  date : {type : Date , require : true},
  edad : {type : Number},
  genre : {type : String , require : true},
  pais : {type : String},
  ciudad : {type : String},
  distrito : {type : String},
  postal : {type : String},
  credentials: { type: Schema.Types.ObjectId, ref: 'Credential' },
  followers: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Array para almacenar seguidores
  following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
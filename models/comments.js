// models/comment.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  author: { type: Schema.Types.ObjectId, ref: 'Credential', required: true }, // Autor del comentario
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true } // Referencia al post al que pertenece el comentario
});

module.exports = mongoose.model('Comment', CommentSchema);

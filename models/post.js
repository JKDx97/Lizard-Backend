const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  content: { type: String},
  createdAt: { type: Date, default: Date.now },
  photo: { type: String, require : false },
  author: { type: Schema.Types.ObjectId, ref: 'Credential', required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: 'Like' }],
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }] // Referencia a los comentarios (opcional)
 
  // Referencia a los "me gusta"
  // Referencia al usuario que crea el post
});

module.exports = mongoose.model('Post', PostSchema);
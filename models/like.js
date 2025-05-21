const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LikeSchema = new Schema({
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'Credential', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Like', LikeSchema);
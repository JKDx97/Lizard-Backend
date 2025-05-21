  const mongoose = require('mongoose')

  const Schema = mongoose.Schema

  const CredentialSchema = new Schema({
      username: { type: String, required: true , unique: true,   },
      password: { type: String, required: true },
      email: { type: String, required: true , unique: true, },
      status: { type: Boolean, default: true },
      codeResetPass: { type: Number },
      createdAt: { type: Date, default: Date.now },
      profile: { type: Schema.Types.ObjectId, ref: 'Profile' }  // Relación directa

    });
    
    module.exports = mongoose.model('Credential', CredentialSchema);
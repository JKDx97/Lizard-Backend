const bcrypt = require('bcryptjs');
const Credential = require('../models/credential');
const User = require('../models/user');
const userSocketMap = require('../utils/socketMap'); // 👈

module.exports = (socket) => {
  socket.on('login', async ({ username, password }) => {
    try {
      const credential = await Credential.findOne({ username });

      if (!credential) {
        return socket.emit('login_error', { msg: 'Credenciales inválidas' });
      }

      const isMatch = await bcrypt.compare(password, credential.password);
      if (!isMatch) {
        return socket.emit('login_error', { msg: 'Credenciales inválidas' });
      }

      const user = await User.findOne({ credentials: credential._id }).populate('credentials');
      if (!user) {
        return socket.emit('login_error', { msg: 'No se encontraron datos del usuario' });
      }

      socket.userId = credential._id;
      userSocketMap.set(credential._id.toString(), socket.id);
      console.log(`✅ Usuario ${credential.username} conectado con socket ${socket.id}`);

      socket.emit('login_success', {
        msg: 'Inicio de sesión exitoso',
        user: {
          _id: credential._id,
          username: credential.username,
          email: credential.email,
          name: user.name,
          lastName: user.lastName,
          edad: user.edad,
          genre: user.genre,
          pais: user.pais,
          ciudad: user.ciudad,
          distrito: user.distrito,
          postal: user.postal
        }
      });
    } catch (error) {
      console.error('Error en el proceso de login:', error);
      socket.emit('login_error', { msg: 'Error en el servidor', details: error.message });
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, sockId] of userSocketMap.entries()) {
      if (sockId === socket.id) {
        userSocketMap.delete(userId);
        console.log(`❌ Usuario ${userId} desconectado`);
        break;
      }
    }
  });
};

const bcrypt = require('bcryptjs');
const Credential = require('../models/credential');
const User = require('../models/user');

const userSocketMap = new Map(); // 👈 Mapa global aquí (también puedes moverlo a un archivo común y exportarlo si prefieres)

module.exports = (socket) => {
  socket.on('login', async ({ username, password }) => {
    try {
      // Buscar las credenciales del usuario por su nombre de usuario
      const credential = await Credential.findOne({ username });

      if (!credential) {
        return socket.emit('login_error', { msg: 'Credenciales inválidas' });
      }

      // Comparar las contraseñas
      const isMatch = await bcrypt.compare(password, credential.password);
      if (!isMatch) {
        return socket.emit('login_error', { msg: 'Credenciales inválidas' });
      }

      // Buscar los datos completos del usuario asociados a las credenciales usando populate
      const user = await User.findOne({ credentials: credential._id }).populate('credentials');

      if (!user) {
        return socket.emit('login_error', { msg: 'No se encontraron datos del usuario' });
      }

      socket.userId = credential._id.toString();
      userSocketMap.set(socket.userId, socket.id); 

      socket.userId = credential._id;


      // Emitir evento de inicio de sesión exitoso con todos los datos del usuario
      socket.emit('login_success', { 
        msg: 'Inicio de sesión exitoso', 
        user: {
          _id : credential._id,
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
    // Eliminar el socket del mapa si existe
    if (socket.userId) {
      userSocketMap.delete(socket.userId);
    }
    console.log(`Socket desconectado: ${socket.id}`);
  });
};

module.exports.userSocketMap = userSocketMap; // 👈 Exportar si quieres usarlo en messageController.js

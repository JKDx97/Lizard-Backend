// controllers/messageController.js
const Message = require('../models/message');
const mongoose = require('mongoose');
const { userSocketMap } = require('../app'); // ajusta la ruta si es necesario

// Envía un mensaje entre dos usuarios
exports.sendMessage = async (req, res) => {
  const { senderId, receiverId, content } = req.body;

  if (!senderId || !receiverId || !content) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    const message = new Message({
      sender: new mongoose.Types.ObjectId(senderId),
      receiver: new mongoose.Types.ObjectId(receiverId),
      content,
    });

    await message.save();
    // Emitir mensaje al receptor específico si está conectado
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      req.io.to(receiverSocketId).emit('newMessage', message);
      console.log(`Mensaje enviado a ${receiverId} en socket ${receiverSocketId}`);
    }

    req.io.emit('newMessage', message);
    console.log('Evento newMessage emitido:', message);

    res.status(201).json({ message: 'Mensaje enviado exitosamente.', data: message });
  } catch (error) {
    console.error('Error en sendMessage:', error);
    res.status(500).json({ error: 'Error al enviar el mensaje.' });
  }
};
exports.getMessages = async (req, res) => {
  const { senderId, receiverId } = req.params;

  if (!senderId || !receiverId) {
    return res.status(400).json({ error: 'Los IDs de ambos usuarios son necesarios.' });
  }

  try {
    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    }).sort({ createdAt: 1 }); // Ordena por fecha de creación, de más antiguo a más reciente

    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los mensajes.' });
  }
};

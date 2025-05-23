const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const loginHandler = require('./controllers/login');
const db = require('./db/db');
const Message = require('./models/message'); // Asegúrate de importar el modelo Message

db();
const allowedOrigins = [process.env.FRONTEND_ORIGIN, 'http://localhost:4200'];

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true

    }
});

// Configurar CORS para las rutas HTTP
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
}));
// Middleware para analizar cuerpos JSON
app.use(express.json());

app.use((req, res, next) => {
    req.io = io; // Adjuntar el objeto `io` a cada petición
    next();
});

const socketHandlers = require('./sockets/socketHandlers')


const valid = require('./validators/router-valid');
app.use('/valid', valid);

const register = require('./router/register-router');
app.use('/register', register);

const post = require('./router/post-router')
app.use('/post', post)

const profile = require('./router/profile-router')
app.use('/profile', profile)

const otherProfile = require('./router/otherProfile-router')
app.use('/other', otherProfile)

const like = require('./router/like-router')
app.use('/like', like)

const comment = require('./router/comments-router')
app.use('/comm', comment)

const follow = require('./router/follow-router')
app.use('/foll', follow)

const message = require('./router/message-router')
app.use('/mess', message)


io.on('connection', (socket) => {

    // Manejar el inicio de sesión
    socketHandlers(socket);

    // Escuchar el evento de desconexión
    console.log(`✅ Socket conectado: ${socket.id}`);

    socket.on('registerUser', (userId) => {
        if (userId) {
            userSocketMap.set(userId.toString(), socket.id);
            console.log(`🧠 Usuario ${userId} registrado con socket ID ${socket.id}`);
        }
    });

    socket.on('disconnect', () => {
        for (const [userId, socketId] of userSocketMap.entries()) {
            if (socketId === socket.id) {
                userSocketMap.delete(userId);
                console.log(`❌ Usuario ${userId} desconectado`);
                break;
            }
        }
    });


    // Escuchar el evento de logout
    socket.on('logout', () => {
        console.log('Un usuario se ha desconectado');
        socket.disconnect(); // Desconectar el socket
    });
});
const PORT = process.env.PORT || 3000;

// Iniciar el servidor
server.listen(PORT, () => {
    console.log(`Servidor ejecutándose en puerto ${PORT}`);
});
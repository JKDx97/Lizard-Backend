const mongoose = require('mongoose');
require('dotenv').config();

const connect = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Atlas conectado: ${conn.connection.host}`);
    } catch (err) {
        console.error('❌ Error al conectar con MongoDB Atlas:', err.message);
        process.exit(1);
    }
};

module.exports = connect;

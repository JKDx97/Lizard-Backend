const Credential = require('../models/credential');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  const { username, email, password, name, lastName, date, genre,pais,ciudad,distrito,postal } = req.body;

  try {
    const hashPassword = await bcrypt.hash(password, 10);
    const credential = new Credential({
      username,
      email,
      password: hashPassword
    });

    await credential.save();

    const today = new Date();
    const birthDate = new Date(date);
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    const newUser = new User({
      name,
      lastName,
      date,          
      edad: age,     
      genre,
      credentials: credential._id,
      pais,
      ciudad,
      distrito,
      postal
    });

    await newUser.save();

    res.json({ msg: 'Usuario registrado con éxito', user: newUser, credentials: credential });

  } catch (error) {
    console.error('Error en el registro:', error); // Imprime el error en la consola del servidor
    res.status(500).json({ error: 'Error al registrar el usuario y las credenciales', details: error.message });  }
};

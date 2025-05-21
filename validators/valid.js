const Credential = require ('../models/credential')

module.exports.checkUser = async (req, res) => {
    const { username } = req.query;
    try {
      const userExists = await Credential.findOne({ username });
      res.json({ isTaken: !!userExists }); // Devuelve `true` si existe, `false` si no
    } catch (error) {
      console.error('Error al verificar el nombre de usuario:', error);
      res.status(500).json({ error: 'Error al verificar el nombre de usuario' });
    }
  };

module.exports.checkEmail = async(req,res)=>{
    const { email } = req.query
    try {
        const emailExists = await Credential.findOne({email})
        res.json({ isTaken: !!emailExists }); // Devuelve `true` si existe, `false` si no
    } catch (error) {
        console.error('Error al verificar el correo electrónico:', error);
        res.status(500).json({ error: 'Error al verificar el correo electrónico' });
    }
}


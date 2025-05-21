const authController = require('../controllers/login');
module.exports = (socket) => {
  authController(socket);
};
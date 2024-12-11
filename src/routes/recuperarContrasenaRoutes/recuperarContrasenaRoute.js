// backend/routes/resetPasswordRoutes.js
const { Router } = require('express');
const route = Router();
  // Asegúrate de usar express.Router() para crear el router

const recuperarContrasena = require('../../controllers/recuperarContrasena/recuperarContrasena');

// Ruta para solicitar restablecimiento de contraseña
route.post('/solicitar-restablecimiento', recuperarContrasena.solicitarRestablecimiento);

route.post('/cambiar-contrasena', recuperarContrasena.cambiarContrasena);
route.post('/enviar-correo', recuperarContrasena.enviarCorreo);





module.exports = route;

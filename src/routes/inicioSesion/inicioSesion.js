const { Router } = require('express');
const route = Router();
const inicioSesion = require('../../controllers/inicioSesion/inicioSesionController');

router.post('/login', inicioSesion.iniciarSesion);

module.exports = route;
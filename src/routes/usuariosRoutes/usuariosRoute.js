const { Router } = require('express');
const route = Router();
const verificarToken = require('../../../middlewares/vefiricarToken');

const { getUsuarioByd,
    getUsuarios,
    postUsuario,
    putUsuario,
    deleteUsuario,
    actualizarPerfil,
    actualizarEstadoUsuario, } = require('../../controllers/usuariosController/usuariosController');

// Obtener todos los usuarios
route.get('/usuarios', getUsuarios);

// Crear un nuevo usuario
route.post('/createUsuario', postUsuario);

// Obtener un usuario por ID
route.get('/obtener/:id_usuario', getUsuarioByd);

// Actualizar un usuario por ID
route.put('/modificar/:id_usuario', putUsuario);

// Eliminar un usuario por ID
route.delete('/usuarios/:id_usuario', deleteUsuario);
route.put('/actualizarPerfil', verificarToken, actualizarPerfil);
route.put('/:id/estado', actualizarEstadoUsuario);

module.exports = route;

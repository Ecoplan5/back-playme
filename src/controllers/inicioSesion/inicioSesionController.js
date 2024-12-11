const jwt = require('jsonwebtoken');
const { sequelize } = require('../../../database/config');
const Usuario = require('../../models/usuariosModel/usuariosModel');
const { response } = require('express');
const bcrypt = require('bcrypt');
const fs = require('fs'); // Importar el módulo fs
const path = require('path'); // Importar el módulo path

async function iniciarSesion(req, res = response) {
  const { nombre_usuario, contrasena } = req.body;

  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');

    const usuarioEncontrado = await Usuario.findOne({
      where: { nombre_usuario },
   
    });

    


    if (!usuarioEncontrado) {
      res.status(401).json({ mensaje: 'Usuario no encontrado' });
      return;
    }

    // Verificar si la foto del usuario existe en la carpeta
    if (usuarioEncontrado.foto) {
      const rutaSinDirname = path.join('uploads', usuarioEncontrado.foto);
      if (!fs.existsSync(rutaSinDirname)) {
        console.error(`Imagen no encontrada en la ruta: ${rutaSinDirname}`);
        res.status(404).json({ mensaje: 'Imagen no encontrada' });
        return;
      }
    }


    if (bcrypt.compareSync(contrasena, usuarioEncontrado.contrasena)) {
      if (usuarioEncontrado.estado === 'Inactivo') {
        res.status(403).json({ mensaje: 'Usuario inactivo, no puede iniciar sesión' });
        return;
      }

      // Configurar la URL de la imagen de perfil
      const foto = usuarioEncontrado.foto ? `http://localhost:8095/uploads/${usuarioEncontrado.foto}` : null;

      const usuarioFormateado = {
        userId: usuarioEncontrado.id_usuario,
        nombre_usuario: usuarioEncontrado.nombre_usuario,
    
        email: usuarioEncontrado.email,
        created_at: usuarioEncontrado.created_at,
        updated_at: usuarioEncontrado.updated_at,
        estado: usuarioEncontrado.estado,
        foto, // Incluye la URL de la imagen de perfil
      };


      const token = generarToken(usuarioFormateado);

      // Imprimir datos de los usuarios después del inicio de sesión exitoso
      console.log("Datos del usuario que inicia sesión:", usuarioFormateado);

      res.json({
        token,
        usuario: usuarioFormateado,
      });
    } else {
      res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }
  } catch (error) {
    console.error('Error al buscar el usuario:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

function generarToken(usuario, tipoToken) {
  const { id_usuario, nombre_usuario } = usuario;

  // Define la duración del token de restablecimiento (por ejemplo, 1 día)
  const duracionTokenReset = '1d';

  if (tipoToken === 'reset') {
    return jwt.sign({ userId: id_usuario, tipo: 'reset' }, 'secreto-seguro', { expiresIn: duracionTokenReset });
  }

  return jwt.sign({ nombre_usuario, userId: id_usuario}, 'secreto-seguro', { expiresIn: '24h' });
}

module.exports = {
  iniciarSesion,
  generarToken
};





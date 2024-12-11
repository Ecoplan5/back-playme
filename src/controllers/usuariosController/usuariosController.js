const Usuario = require('../../models/usuariosModel/usuariosModel');
const { response } = require('express');

const { Sequelize } = require('sequelize');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');



const getUsuarios = async (req, res = response) => {
  try {
    const usuarios = await Usuario.findAll({
    });
    res.json({ usuarios });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};



const getUsuarioByd = async (req, res = response) => {
  const {id_usuario } = req.params;

  try {
    const usuario = await Usuario.findByPk(id_usuario);

    if (usuario) {
      const usuarioConImagen = {
        ...usuario.toJSON(),
        foto: usuario.foto
          ? `http://localhost:8095/uploads/${usuario.foto}` // Ruta completa de la imagen
          : null, // O puedes asignar un avatar por defecto aquí
      };

      res.json(usuarioConImagen);
    } else {
      res.status(404).json({ error: `No se encontró el usuario con ID ${id_usuario}` });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el usuario" });
  }
};

const postUsuario = async (req, res = response) => {
  const { nombre_usuario, contrasena, email, foto } = req.body;
  console.log(req.body);  // Verifica que id_rol esté presente

  try {
    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    console.log('Usuario encontrado:', usuarioExistente);
    
    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        error: 'El correo electrónico ya está en uso.'
      });
    }

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const contrasenaEncriptada = await bcrypt.hash(contrasena, salt);

    // Crear el nuevo usuario
    const nuevoUsuario = await Usuario.create({
      nombre_usuario,
      contrasena: contrasenaEncriptada,
      email,
      foto,
    });

    res.status(201).json({
      success: true,
      message: 'Usuario creado con éxito.',
      usuario: nuevoUsuario
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Error al crear el usuario.'
    });
  }
};


// // Crear un nuevo usuario
// const postUsuario = async (req, res = response) => {
//   const { nombre_usuario, contrasena, email, foto } = req.body;
//   console.log(req.body);  // Verifica que id_rol esté presente

//   try {
//     // Verificar si el usuario ya existe
//     const usuarioExistente = await Usuario.findOne({ where: { email } });
//     if (usuarioExistente) {
//       return res.status(400).json({
//         success: false,
//         error: 'El correo electrónico ya está en uso.'
//       });
//     }

//     // Encriptar la contraseña
//     const salt = await bcrypt.genSalt(10);
//     const contrasenaEncriptada = await bcrypt.hash(contrasena, salt);

//     // Crear el nuevo usuario incluyendo el campo id_rol
//     const nuevoUsuario = await Usuario.create({
//       nombre_usuario,
//       contrasena: contrasenaEncriptada,
//       email,
//       foto,
//     });

//     res.status(201).json({
//       success: true,
//       message: 'Usuario creado con éxito.',
//       usuario: nuevoUsuario
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       error: 'Error al crear el usuario.'
//     });
//   }
// };


const putUsuario = async (req, res = response) => {
  const { id_usuario } = req.params;
  const updatedData = req.body;

  try {
    const usuario = await Usuario.findByPk(id_usuario);

    if (!usuario) {
      return res
        .status(404)
        .json({ error: `No se encontró un elemento de Usuario con ID ${id_usuario}` });
    }

    // Validar si se está intentando cambiar el nombre de usuario (ignorando mayúsculas/minúsculas)
    if (
      updatedData.nombre_usuario &&
      updatedData.nombre_usuario.toLowerCase() !== usuario.nombre_usuario.toLowerCase()
    ) {
      const existingUsername = await Usuario.findOne({
        where: { nombre_usuario: updatedData.nombre_usuario },
      });

      if (existingUsername) {
        return res
          .status(400)
          .json({ error: "El nombre de usuario ya está en uso" });
      }
    }

    // Validar si se está intentando cambiar el correo
    if (updatedData.email && updatedData.email !== usuario.email) {
      const existingEmail = await Usuario.findOne({
        where: { email: updatedData.email },
      });

      if (existingEmail) {
        return res
          .status(400)
          .json({ error: "El correo electrónico ya está en uso" });
      }
    }

    await usuario.update(updatedData);
    res.json({ msg: `El elemento de Usuario fue actualizado exitosamente.` });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error al actualizar el elemento de Usuario" });
  }
};


const deleteUsuario = async (req, res = response) => {
  const { id_usuario} = req.params;

  try {
    const usuario = await Usuario.findByPk(id_usuario);

    if (usuario) {
      await usuario.destroy();
      res.json("Elemento de Usuario eliminado exitosamente");
    } else {
      res
        .status(404)
        .json({ error: `  No se encontró un elemento de usuario con ID ${id_usuario}` });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: " Error al eliminar el elemento de usuario" });
  }
};

const actualizarPerfil = async (req, res) => {
  try {
    const { nombre, email, nuevaContrasena } = req.body;

    // Verifica y decodifica el token de autenticación
    const authorizationHeader = req.headers["authorization"];
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      return res.status(401).json({ mensaje: "Token no válido" });
    }

    const token = authorizationHeader.split(" ")[1];
    const decodedToken = jwt.verify(token, "secreto-seguro");

    // Busca al usuario por ID
    const usuario = await Usuario.findOne({
      where: { nombre_usuario: decodedToken.nombre_usuario },
    });

    if (!usuario) {
      return res
        .status(404)
        .json({ mensaje: " P002 - E002 Usuario no encontrado", decodedToken });
    }

    // Registra los cambios realizados
    const cambiosRealizados = {};

    // Actualiza los campos del perfil y registra cambios
    if (nombre && nombre !== usuario.nombre_usuario) {
      cambiosRealizados.nombre_usuario = { antes: usuario.nombre_usuario, despues: nombre };
      usuario.nombre_usuario = nombre;
    }

    if (email && email !== usuario.email) {
      cambiosRealizados.email = { antes: usuario.email, despues: email };
      usuario.email = email;
    }

    // Actualiza la contraseña si se proporciona una nueva
    if (nuevaContrasena) {
      const hashedContrasena = await bcrypt.hash(nuevaContrasena, 10);
      cambiosRealizados.contrasena = { antes: "****", despues: "****" }; // No muestres contraseñas reales
      usuario.contrasena = hashedContrasena;
    }

    // Guarda los cambios en la base de datos
    await usuario.save();

    res.json({
      mensaje: "Perfil actualizado con éxito",
      cambios: cambiosRealizados,
    });
  } catch (error) {
    console.error("Error al actualizar el perfil:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      if (error.fields.nombre_usuario) {
        return res
          .status(400)
          .json({ mensaje: " El nombre de usuario ya está en uso" });
      } else if (error.fields.email) {
        return res
          .status(400)
          .json({ mensaje: "  El correo electrónico ya está en uso" });
      }
    }
    res.status(500).json({ mensaje: " Por favor, ingrese un correo electrónico válido" });
  }
};


const actualizarEstadoUsuario = async (req, res = response) => {
  const { id_usuario } = req.params;
  const { estado } = req.body;

  try {
    const usuario = await Usuario.findByPk(id_usuario);

    if (usuario) {
      usuario.estado = estado;
      await usuario.save();

      res.json({ mensaje: "Estado de usuario actualizado correctamente" });
    } else {
      res.status(404).json({ error: `No se encontró un usuario con ID ${id_usuario}` });
    }
  } catch (error) {
    console.error("Error al actualizar estado de usuario:", error);
    res.status(500).json({ error: "Error al actualizar estado de usuario" });
  }
};

module.exports = {
  getUsuarioByd,
  getUsuarios,
  postUsuario,
  putUsuario,
  deleteUsuario,
  actualizarPerfil,
  actualizarEstadoUsuario,
};

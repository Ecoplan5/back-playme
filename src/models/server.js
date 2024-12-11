const express = require('express');
const bcrypt = require('bcrypt');

const cors = require('cors');
const bodyParser = require('body-parser');



const http = require('http');
const { iniciarSesion } = require('../controllers/inicioSesion/inicioSesionController');
const recuperarContrasena = require('../controllers/recuperarContrasena/recuperarContrasena');
const solicitarRestablecimiento = require('../controllers/recuperarContrasena/recuperarContrasena');
const editarPerfil = require('../controllers/usuariosController/usuariosController');
const scrapingRoutes = require('../routes/scraping');

const path = require('path');
const Nexmo = require('nexmo');






class Server {
    constructor() {
        this.app = express();
        this.app.use(bodyParser.json());

        this.port = 8092;
        this.path = '/api';
        this.middlewares();
        this.routes();
        this.createServer();

        // this.inicializarBaseDeDatos();

        this.createServer();
    }

    createServer() {
        this.server = http.createServer(this.app);
    }


    // Configura el middleware para analizar el cuerpo de las solicitudes
    middlewares() {

     

        this.app.use(express.json()); // Analiza cuerpos JSON
        this.app.use(express.urlencoded({ extended: true })); // Analiza cuerpos URL-encoded
        this.app.use(cors()); // Habilita CORS (si es necesario)
        this.app.use(bodyParser.json());


        // Desactivar caché para evitar que el navegador use versiones antiguas
        this.app.use((req, res, next) => {
            res.setHeader('Cache-Control', 'no-store');
            next();
        });

        // // Sirve las imágenes almacenadas en el directorio 'uploads'
        this.app.use('/uploads', express.static(path.resolve('uploads')));
        // Servir archivos estáticos de la carpeta "uploads"
    }

    createServer() {
        this.server = http.createServer(this.app);
    }

    listen() {
        this.server.listen(this.port, () => {
            console.log(`Está escuchando por el puerto ${this.port}`);
        });
    }

    // async inicializarBaseDeDatos() {
    //     try {
    //         const cantidadRoles = await Rol.count();
    //         const cantidadUsuarios = await Usuario.count();

    //         if (cantidadRoles === 0) {
    //             await Rol.bulkCreate([
    //                 { nombre: 'SuperAdmin', estado: 'Activo' },
    //                 { nombre: 'Cliente', estado: 'Activo' }
    //             ]);
    //             console.log('Se ha creado el rol por defecto.');
    //         }

    //         if (cantidadUsuarios === 0) {
    //             // Encripta la contraseña antes de crear el usuario por defecto
    //             const contrasenaEncriptada = await bcrypt.hash('12345678', 10);

    //             await Usuario.create({
    //                 id_usuario: 1,
    //                 id_rol: 1,
    //                 nombre_usuario: 'Admin',
    //                 contrasena: contrasenaEncriptada,
    //                 email: 'ecoplan38@gmail.com',
    //                 estado: 'Activo',
    //             });
    //             console.log('Se ha creado el usuario por defecto.');
    //         }
    //     } catch (error) {
    //         console.error('Error al inicializar la base de datos:', error);
    //     }
    // }



    routes() {
        this.app.use(this.path, require('../routes/usuariosRoutes/usuariosRoute'));
        this.app.use(this.path, require('../routes/scraping',scrapingRoutes));

      


        this.app.post(`${this.path}/login`, iniciarSesion);
        this.app.post(`${this.path}/cambiar-contrasena`, recuperarContrasena.cambiarContrasena);
        this.app.post(`${this.path}/solicitar-restablecimiento`, solicitarRestablecimiento.solicitarRestablecimiento);
        this.app.post(`${this.path}/actualizarPerfil`, editarPerfil.actualizarPerfil);


        // Ruta para enviar un mensaje de WhatsApp
        this.app.post(`${this.path}/enviar-whatsapp`, async (req, res) => {
            const body = req.body;

            try {
                const from = 'sionbarbershop-app';
                const prefix = '+57';
                const toUsuario = prefix + body.telefonoUsuario;
                const toEmpleado = prefix + body.telefonoEmpleado;


                // Configurar Nexmo
                const nexmo = new Nexmo({
                    apiKey: '91875ba2',
                    apiSecret: 'imX6kZ8BG98XVSq1'
                });

                // Enviar mensaje de WhatsApp al usuario (cliente)
                nexmo.message.sendSms(from, toUsuario, text, (error, response) => {
                    if (error) {
                        console.error(error);
                        return res.status(500).json({ error: 'Error al enviar el mensaje de WhatsApp al usuario' });
                    } else {
                        console.log(response);
                    }
                });

                // Enviar mensaje de WhatsApp al empleado
                nexmo.message.sendSms(from, toEmpleado, text, (error, response) => {
                    if (error) {
                        console.error(error);
                        return res.status(500).json({ error: 'Error al enviar el mensaje de WhatsApp al empleado' });
                    } else {
                        console.log(response);
                    }
                });

                res.json({ message: 'Mensajes de WhatsApp enviados correctamente' });
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Error al enviar mensajes de WhatsApp' });
            }
        });

    }

    handleErrors() {
        // Coloca el middleware de manejo de errores al final de la cadena de middlewares
        this.app.use(errorHandler);
    }
}

module.exports = Server;

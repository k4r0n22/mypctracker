import express from "express";
import session from "express-session";
import morgan from "morgan";
import cors from 'cors';
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import indexRoutes from "./routes/index.js";
import { pool } from "./db/db.js";
import { actualizarUltimaUbicacion } from "./locationStorage/locationStorage.js";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import path from 'path';

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

// Generar secreto aleatorio y seguro
const secret = crypto.randomBytes(64).toString('hex');

app.set("port", process.env.PORT || 3000);
app.set("views", join(__dirname, "views"));
app.set("view engine", "ejs");

// Configurar sesión
app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: true,
}));

// Middleware para gestionar las cookies
app.use((req, res, next) => {
    if (!req.session.views) {
        req.session.views = 1;
    } else {
        req.session.views++;
    }
    next();
    });

// Middleware para el login
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(indexRoutes);
app.use(express.static(join(__dirname, "public")));


// Ruta para recibir datos de ubicación y enviar notificación
app.post('/send-notification', async (req, res) => {
    const { title, message, deviceId, ubicacion, userId } = req.body; // Asegúrate de recibir el userId

    console.log('Datos recibidos:', JSON.stringify(req.body, null, 2));

    const { Region, Pais, IP, Longitud, Ciudad, Latitud } = ubicacion;

    // Actualiza la última ubicación (locationStorage.js)
    actualizarUltimaUbicacion({
        Region,
        Pais,
        IP,
        Longitud,
        Ciudad,
        Latitud
    });

    console.log(`Notificación enviada a dispositivo: ${IP} - ${Ciudad} - ${Region} - ${Pais} - ${Latitud} - ${Longitud}`);

    // Me creo una cadena que tiene el SQL que voy a lanzar a la base de datos
    const sql = `INSERT INTO ubicacion (userId, ip, ciudad, region, pais, latitud, longitud) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    try {
        // Lanzo la query using async/await
        await pool.query(sql, [userId, IP, Ciudad, Region, Pais, Latitud, Longitud]);
        console.log("Ubicación insertada correctamente");
        res.status(200).send('Notificación enviada');
    } catch (err) {
        console.log("Error al insertar ubicación:", err);
        res.status(500).send('Error al procesar la solicitud');
    }
});


app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    console.log('Datos del usuario:', JSON.stringify(req.body, null, 2));

    try {
        // Verificar si el correo electrónico ya está registrado
        const emailExistQuery = 'SELECT COUNT(*) AS count FROM users WHERE email = ?';
        const [rows] = await pool.query(emailExistQuery, [email]);
        const emailCount = rows[0].count;

        if (emailCount > 0) {
            // Si el correo electrónico ya está registrado, enviar un mensaje de error
            return res.status(400).send('El correo electrónico ya está registrado');
        }

        // Generar hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar el nuevo usuario en la base de datos
        const insertUserQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        await pool.query(insertUserQuery, [username, email, hashedPassword]);
        
        console.log("Usuario insertado correctamente");
        res.status(200).redirect("/login");
    } catch (err) {
        console.log("Error al insertar el usuario:", err);
        res.status(500).send('Error al procesar la solicitud');
    }
});


app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Consultar la base de datos para obtener la contraseña asociada con el correo electrónico proporcionado
        const loginQuery = 'SELECT password FROM users WHERE email = ?';
        const [rows] = await pool.query(loginQuery, [email]);

        // Verificar si se encontró un usuario con el correo electrónico proporcionado
        if (rows.length === 0) {
            return res.status(400).send('Correo electrónico no registrado');
        }

        // Obtener la contraseña almacenada en la base de datos
        const hashedPassword = rows[0].password;

        // Comparar la contraseña proporcionada con la contraseña almacenada utilizando bcrypt.compare()
        bcrypt.compare(password, hashedPassword, (err, result) => {
            if (err) {
                console.error('Error al comparar contraseñas:', err);
                return res.status(500).send('Error en la autenticación');
            }
            if (result) {
                // Si las contraseñas coinciden, iniciar sesión
                req.session.loggedin = true;
                req.session.username = email;
                res.redirect("/tracker");
                //res.send(`Bienvenido <strong>${req.session.usuario}</strong>`);
            } else {
                // Si las contraseñas no coinciden, enviar un mensaje de error
                res.status(400).send('Contraseña incorrecta');
            }
        });
    } catch (error) {
        console.error('Error en la autenticación:', error);
        res.status(500).send('Error en la autenticación del usuario');
    }
});

app.listen(app.get("port"), () => {
    console.log("Server on port", app.get("port"));
});

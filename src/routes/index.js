import { Router } from "express";
import { obtenerUltimaUbicacion, actualizarUltimaUbicacion, actualizarUbicacionMaps } from '../locationStorage/locationStorage.js';
import path from 'path'; // Importar el módulo path
import { pool } from "../db/db.js"; // Ajusta la ruta según la ubicación real de tu archivo db.js
import bcrypt from 'bcrypt';


const router = Router();

// Middleware para verificar el estado de inicio de sesión
const requireLogin = (req, res, next) => {
    if (!req.session.loggedin) {
        res.redirect("/login"); // Redirigir al usuario a la página de inicio de sesión si no ha iniciado sesión
    } else {
        next(); // Continuar con la solicitud si el usuario ha iniciado sesión
    }
};

router.get("/", (req, res) => {
    //req.session.usuario = 'Carlos Gonzalez';
    //req.session.rol = 'Admin';
    //req.session.visitas = req.session.visitas ? ++req.session.visitas : 1;
    res.redirect("/index");
});

router.get("/index", (req, res) => {
    res.render("index", { title: "MYPCTRACKER" });
});

router.get("/about", (req, res) => {
    res.render("about", { title: "About this Project" });
});

router.get("/contact", (req, res) => {
    res.render("contact", { title: "Contact Page" });
});

router.get('/tracker', requireLogin, (req, res) => {
    const lastLocation = obtenerUltimaUbicacion();
    res.render("tracker", { lastLocation });
});

router.get("/login", (req, res) => {
    res.render("login", { title: "Login" });
});

router.post('/login', async (req, res) => {
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

router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            res.status(500).send('Error al cerrar sesión');
        } else {
            res.redirect("/login");
        }
    });
});

router.get("/borrar-ubicacion", (req, res) => {
    actualizarUltimaUbicacion(null);
    res.redirect("/tracker");
});

router.get('/register', (req, res) => {
    res.render('register', { title: 'Register' });
});

export default router;

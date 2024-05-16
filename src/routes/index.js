import { Router } from "express";
import { obtenerUltimaUbicacion, actualizarUltimaUbicacion } from '../locationStorage/locationStorage.js';
import path from 'path';
import { pool } from "../db/db.js";
import bcrypt from 'bcrypt';

const router = Router();

// Middleware para verificar el estado de inicio de sesión
const requireLogin = (req, res, next) => {
    if (!req.session.loggedin) {
        res.redirect("/login");
    } else {
        next();
    }
};

router.get("/", (req, res) => {
    res.redirect("/index");
});

router.get("/index", (req, res) => {
    res.render("index", { title: "MYPCTRACKER", loggedin: req.session.loggedin, username: req.session.username });
});

router.get("/about", (req, res) => {
    res.render("about", { title: "About this Project", loggedin: req.session.loggedin, username: req.session.username });
});

router.get("/contact", (req, res) => {
    res.render("contact", { title: "Contact Page", loggedin: req.session.loggedin, username: req.session.username });
});

router.get('/tracker', requireLogin, async (req, res) => {
    try {
        const userId = req.session.username;
        const sql = 'SELECT * FROM ubicacion WHERE userId = ? ORDER BY id DESC LIMIT 1';
        const [rows] = await pool.query(sql, [userId]);

        const lastLocation = rows.length > 0 ? rows[0] : null;
        res.render("tracker", { lastLocation, title: "Tracker", username: userId, loggedin: req.session.loggedin });
    } catch (error) {
        console.error('Error al obtener la última ubicación:', error);
        res.status(500).send('Error al procesar la solicitud');
    }
});

router.get("/login", (req, res) => {
    res.render("login", { title: "Login", loggedin: req.session.loggedin, username: req.session.username });
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const loginQuery = 'SELECT password FROM users WHERE email = ?';
        const [rows] = await pool.query(loginQuery, [email]);

        if (rows.length === 0) {
            return res.status(400).send('Correo electrónico no registrado');
        }

        const hashedPassword = rows[0].password;

        bcrypt.compare(password, hashedPassword, (err, result) => {
            if (err) {
                console.error('Error al comparar contraseñas:', err);
                return res.status(500).send('Error en la autenticación');
            }
            if (result) {
                req.session.loggedin = true;
                req.session.username = email;
                res.redirect("/tracker");
            } else {
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
    res.render('register', { title: 'Register', loggedin: req.session.loggedin, username: req.session.username });
});

export default router;

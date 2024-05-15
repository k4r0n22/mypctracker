import { Router } from "express";
import { obtenerUltimaUbicacion, actualizarUltimaUbicacion, actualizarUbicacionMaps } from '../locationStorage/locationStorage.js';
//import { registerUser, loginUser } from '../controllers/authController.js';


const router = Router();

router.get("/", (req, res) => {
    req.session.usuario = 'Carlos Gonzalez';
    req.session.rol = 'Admin';
    req.session.visitas = req.session.visitas ? ++req.session.visitas : 1;
    //res.send(`El usuario <strong>${req.session.usuario}</strong>
    //con rol <strong>${req.session.rol}</strong>
    //ha visitado esta página <strong>${req.session.visitas}</strong> veces`)
    //res.render("index", { title: "MYPCTRACKER" });
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

//router.get("/tracker", (req, res) => {
//    const lastLocation = obtenerUltimaUbicacion();
//    res.render("tracker", { lastLocation });
//    const Maps = actualizarUbicacionMaps();
//    res.render("tracker", { Maps });
//});

router.get('/tracker', (req, res) => {
    if (req.session.loggedin) {
    //res.send(`Bienvenido, ${req.session.username}. Número de visitas: ${req.session.views}`);
    const lastLocation = obtenerUltimaUbicacion();
    res.render("tracker", { lastLocation });
    res.render("tracker", { title: "Tracker" });
    } else {
      res.sendFile(path.join(__dirname, 'views', 'login.html')); // Renderizar la página de login
    }
});

router.get("/login", (req, res) => {
    res.render("login", { title: "Login" });
});

//router.get("/tracker", (req, res) => {
//    const lastLocation = obtenerUltimaUbicacion();
//    res.render("tracker", { lastLocation, username: req.params.username });
//});

router.get("/borrar-ubicacion", (req, res) => {
    actualizarUltimaUbicacion(null);
    res.redirect("/tracker");
});

// Ruta para mostrar el formulario de registro
router.get('/register', (req, res) => {
    res.render('register', { title: 'Register' });
});

// Ruta para manejar el registro de usuarios
//router.post('/register', registerUser);

// Ruta para manejar el inicio de sesión de usuarios
//router.post('/login', loginUser);

export default router;

import { Router } from "express";
import { obtenerUltimaUbicacion, actualizarUltimaUbicacion, actualizarUbicacionMaps } from '../locationStorage/locationStorage.js';

const router = Router();

router.get("/", (req, res) => {
    res.render("index", { title: "MYPCTRACKER" });
});

router.get("/about", (req, res) => {
    res.render("about", { title: "About this Project" });
});

router.get("/contact", (req, res) => {
    res.render("contact", { title: "Contact Page" });
});

router.get("/tracker", (req, res) => {
    const lastLocation = obtenerUltimaUbicacion();
    res.render("tracker", { lastLocation });
    const Maps = actualizarUbicacionMaps();
    res.render("tracker", { Maps });
});

router.get("/login", (req, res) => {
    res.render("login", { title: "Login" });
});

router.post('/formulario', (req, res) => {
    const login = req.body.login;
    const passwd = req.body.passwd;

    if (login === 'carlos' && passwd === '1234') {
        res.redirect('/tracker');
    }
});

router.get("/borrar-ubicacion", (req, res) => {
    actualizarUltimaUbicacion(null);
    res.redirect("/tracker");
});

export default router;

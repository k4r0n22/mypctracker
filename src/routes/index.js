import { Router } from "express";
import { obtenerUltimaUbicacion, actualizarUltimaUbicacion } from '../locationStorage/locationStorage.js';

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
});

router.get("/borrar-ubicacion", (req, res) => {
    actualizarUltimaUbicacion(null);
    res.redirect("/tracker");
});

export default router;

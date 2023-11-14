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

// Ruta para mostrar la página "tracker.ejs"
router.get("/tracker", (req, res) => {
    const lastLocation = obtenerUltimaUbicacion();
    res.render("tracker", { lastLocation });
});

// Ruta para borrar la última ubicación
router.get("/borrar-ubicacion", (req, res) => {
    // Actualiza la última ubicación a null
    actualizarUltimaUbicacion(null);
    
    // Redirige de vuelta a la página de tracker
    const lastLocation = obtenerUltimaUbicacion();
    res.render("tracker", { lastLocation });
});

export default router;

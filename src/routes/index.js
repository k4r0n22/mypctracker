// En src/routes/index.js
import { Router } from "express";
import bodyParser from "body-parser";
import { obtenerUltimaUbicacion } from '../locationStorage/locationStorage.js';

const router = Router();

// Middleware para analizar JSON
router.use(bodyParser.json());

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

export default router;

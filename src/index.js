// index.js
import express from "express";
import morgan from "morgan";
import cors from 'cors';
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import indexRoutes from "./routes/index.js";
import { pool } from "./db/db.js";
import { actualizarUltimaUbicacion } from "./locationStorage/locationStorage.js";
import mysql from 'mysql';

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

app.set("port", process.env.PORT || 3000);
app.set("views", join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());

app.use(indexRoutes);

app.use(express.static(join(__dirname, "public")));

// FUNCION PARA GENERAR UN ID UNICO
function generateUniqueId(min, max) {
    const numeroAleatorio = Math.random();
    const resultado = min + Math.floor(numeroAleatorio * (max - min + 1));
    return resultado;
}

// Ruta para recibir datos de ubicación y enviar notificación
app.post('/send-notification', async (req, res) => {
    const { title, message, deviceId, ubicacion } = req.body;

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

    const uniqueId = generateUniqueId(1, 1000);

    // Me creo una cadena que tiene el SQL que voy a lanzar a la base de datos
    const sql = `INSERT INTO ubicacion (id, ip, ciudad, region, pais, Latitud, Longitud) VALUES ('${uniqueId}', '${IP}', '${Ciudad}', '${Region}', '${Pais}', '${Latitud}', '${Longitud}')`;

    console.log(sql);

    try {
        // Lanzo la query using async/await
        await pool.query(sql);
        console.log("Ubicación insertada correctamente");
        res.status(200).send('Notificación enviada');
    } catch (err) {
        console.log("Error al insertar ubicación:", err);
        res.status(500).send('Error al procesar la solicitud');
    }
});

app.listen(app.get("port"), () => {
    console.log("Server on port", app.get("port"));
});

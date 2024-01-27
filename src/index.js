import express from "express";
import morgan from "morgan";
import cors from 'cors';
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import indexRoutes from "./routes/index.js";
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

// Ruta para recibir datos de ubicación y enviar notificación
app.post('/send-notification', (req, res) => {
    const { title, message, deviceId, ubicacion } = req.body;

    console.log('Datos recibidos:', JSON.stringify(req.body, null, 2));

    // Actualiza la última ubicación (locationStorage.js)
    actualizarUltimaUbicacion({
        title,
        message,
        deviceId,
        ...ubicacion
    });

    console.log(`Notificación enviada a dispositivo ${deviceId}: ${title} - ${message}`);
    res.status(200).send('Notificación enviada');
});

// CONEXIÓN CON LA BASE DE DATOS
const mysqlConnection = mysql.createPool({
    host: '192.168.1.216',
    user: 'admin',
    password: 'Andel1928',
    database: 'tracker',
    multipleStatements: true,
    connectionLimit: 10, // Adjust as needed
});

mysqlConnection.getConnection((err, connection) => {
    if (err) {
        console.log('Connection Failed!', err);
    } else {
        console.log('Conexion bbdd correcta...');
        connection.release();
    }
});

app.listen(app.get("port"), () => {
    console.log("Server on port", app.get("port"));
});


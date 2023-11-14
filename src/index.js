import express from "express";
import morgan from "morgan";
import cors from 'cors';
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import indexRoutes from "./routes/index.js";
import { actualizarUltimaUbicacion } from "./locationStorage/locationStorage.js";

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

    // Actualiza la última ubicación utilizando la función de locationStorage.js
    actualizarUltimaUbicacion({
        title,
        message,
        deviceId,
        ...ubicacion
    });

    // Aquí deberías implementar la lógica para enviar notificaciones al dispositivo con el ID único `deviceId`
    // Puedes usar alguna librería de notificaciones push o enviar mensajes a través de un canal que tu dispositivo pueda escuchar

    console.log(`Notificación enviada a dispositivo ${deviceId}: ${title} - ${message}`);
    res.status(200).send('Notificación enviada');
});

app.listen(app.get("port"), () => {
    console.log("Server on port", app.get("port"));
});

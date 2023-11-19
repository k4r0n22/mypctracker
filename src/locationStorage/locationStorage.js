// locationStorage.js
import { inicializarMapa } from "./googleMaps.js";

let lastLocation = null;

const obtenerUltimaUbicacion = () => {
    return lastLocation;
};

// Función para actualizar la última ubicación
const actualizarUltimaUbicacion = (ubicacion) => {
    lastLocation = ubicacion;
};

// Función para actualizar la ubicación en el mapa
const actualizarUbicacionMaps = () => {
    if (lastLocation && lastLocation.Latitud && lastLocation.Longitud) {
        // Llama a la función para inicializar el mapa
        inicializarMapa();

        // Añade un marcador en la nueva ubicación
        var marker = new google.maps.Marker({
            position: { lat: parseFloat(lastLocation.Latitud), lng: parseFloat(lastLocation.Longitud) },
            // 'mapa' es la variable del mapa que se crea en la función inicializarMapa
            map: mapa,
            title: 'Nueva ubicación'
        });
    }
};

export { obtenerUltimaUbicacion, actualizarUltimaUbicacion, actualizarUbicacionMaps };

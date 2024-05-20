import { inicializarMapa } from "./googleMaps.js";

let lastLocation = null;

const obtenerUltimaUbicacion = () => {
    return lastLocation;
};

// Función para actualizar la última ubicación
const actualizarUltimaUbicacion = (ubicacion) => {
    lastLocation = ubicacion;
    fecha = fecha
};

// Función para actualizar la ubicación en el mapa
const actualizarUbicacionMaps = () => {
    if (lastLocation && lastLocation.Latitud && lastLocation.Longitud) {

        inicializarMapa();

        // Añadir un marcador en la nueva ubicación
        var marker = new google.maps.Marker({
            position: { lat: parseFloat(lastLocation.Latitud), lng: parseFloat(lastLocation.Longitud) },
            map: mapa,
            title: 'Nueva ubicación'
        });
    }
};

export { obtenerUltimaUbicacion, actualizarUltimaUbicacion, actualizarUbicacionMaps };

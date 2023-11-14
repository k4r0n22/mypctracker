let lastLocation = null;

// Función para obtener la última ubicación
const obtenerUltimaUbicacion = () => {
    return lastLocation;
};

// Función para actualizar la última ubicación
const actualizarUltimaUbicacion = (ubicacion) => {
    lastLocation = ubicacion;
};

export { obtenerUltimaUbicacion, actualizarUltimaUbicacion };

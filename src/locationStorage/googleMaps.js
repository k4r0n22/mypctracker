export function inicializarMapa() {
    var mapa = new google.maps.Map(document.getElementById('mapa'), {
        center: { lat: 40.2786, lng: -3.7867 },
        zoom: 8
    });
}

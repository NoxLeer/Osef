import countries from '../data/countries.json';

const getRandomCountry = () => {
    const randomIndex = Math.floor(Math.random() * countries.length);
    return countries[randomIndex];
}

const initializeMapBehaviour = (event) => {
    marker.on('click', function (event) {
        var latlng = map.mouseEventToLatLng(ev.originalEvent);
        console.log(latlng.lat + ', ' + latlng.lng);
    });
};
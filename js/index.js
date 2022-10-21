const initializeGame = async () => {
    if (map === undefined) {
        console.error('Map is not initialized');
        return;
    }

    let userMaker, answerMarker;
    let countries = [];
    let countryToFind;
    const validerButton = document.querySelector('.submit');
    const countryToFindElt = document.querySelector('.country-to-find');

    //#region game methods
    const loadCountries = async () => {
        countries = await fetch('https://restcountries.com/v3.1/all?fields=name,latlng')
            .then(response => response.json());
    };

    const getRandomCountry = () => {
        const randomIndex = Math.floor(Math.random() * countries.length);
        return countries[randomIndex];
    };

    const clickOnMapEvent = (event) => {
        if (userMaker !== undefined) {
            map.removeLayer(userMaker);
        }

        var latlng = map.mouseEventToLatLng(event.originalEvent);
        userMaker = L.marker([latlng.lat, latlng.lng])
        userMaker.addTo(map);

        validerButton.disabled = false;
    };

    const initializeMapBehaviour = () => {
        map.addEventListener('click', clickOnMapEvent);
    };

    const validerButtonEvent = () => {
        if (userMaker === undefined) {
            return;
        }

        answerMarker = L.marker([countryToFind.latlng[0], countryToFind.latlng[1]], { icon: greenIcon });
        answerMarker.addTo(map);

        validerButton.onclick = nextCountryButtonEvent;

        validerButton.value = "Prochain pays";

        map.removeEventListener('click', clickOnMapEvent);
    };

    const nextCountry = () => {
        countryToFind = getRandomCountry();
        countryToFindElt.textContent = countryToFind.name.common;
    };

    const nextCountryButtonEvent = () => {
        map.removeLayer(userMaker);
        map.removeLayer(answerMarker);
        nextCountry();

        validerButton.onclick = validerButtonEvent;
        validerButton.value = "Valider";
        validerButton.disabled = true;

        initializeMapBehaviour();
    };

    const initializeValiderButton = () => {
        validerButton.disabled = true;
        validerButton.onclick = validerButtonEvent;
    };
    //#endregion

    await loadCountries();
    initializeMapBehaviour();
    initializeValiderButton();
    nextCountry();
};

window.onload = async () => {
    await initializeGame();
};
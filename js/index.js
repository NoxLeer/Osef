const initializeGame = async () => {
    if (map === undefined) {
        console.error('Map is not initialized');
        return;
    }

    //#region firestore

    // Your web app's Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyCVG1qyRBdRI-PDKhAxhsqNnPtpphcfcfw",
        authDomain: "quizz-app-58df7.firebaseapp.com",
        projectId: "quizz-app-58df7",
        storageBucket: "quizz-app-58df7.appspot.com",
        messagingSenderId: "806347707877",
        appId: "1:806347707877:web:5ffbd566f6d388a1928b0c"
    };

    let db;
    try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
    } catch {
        console.error("firebase sa marche po");
    }

    // ========= //
    let userList = [];
    const loadUserList = async () => {
        const snapshot = await db.collection("users").get();
        userList = snapshot.docs;
    };

    let currentUser = null;

    const addScoreToDbUser = (userDoc, scoreToAdd) => {
        console.log(userDoc);
        let user = userDoc.data();
        user.score += scoreToAdd;
        db.ref('users/' + userDoc.id).set(user);
    }

    const addUserToDb = (pseudo) => {
        let newUser = {
            pseudo: pseudo,
            score: 0
        };

        db.collection("users").add(newUser)
            .then((docRef) => {
                console.log("Document written with ID: ", docRef.id);
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
            });
    };

    //#endregion

    let userMarker, answerMarker;
    let countries = [];
    let countryToFind;
    const validerButton = document.querySelector('.submit');
    const countryToFindElt = document.querySelector('.country-to-find');
    let userScore = 0;
    const userScoreElt = document.querySelector('.score');

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
        if (userMarker !== undefined) {
            map.removeLayer(userMarker);
        }

        var latlng = map.mouseEventToLatLng(event.originalEvent);
        userMarker = L.marker([latlng.lat, latlng.lng])
        userMarker.addTo(map);

        validerButton.disabled = false;
    };

    const initializeMapBehaviour = () => {
        map.addEventListener('click', clickOnMapEvent);
    };

    const validerButtonEvent = async () => {
        if (userMarker === undefined) {
            return;
        }

        answerMarker = L.marker([countryToFind.latlng[0], countryToFind.latlng[1]], { icon: greenIcon });
        answerMarker.addTo(map);

        validerButton.onclick = nextCountryButtonEvent;
        validerButton.value = "Prochain pays";

        map.removeEventListener('click', clickOnMapEvent);

        userScore += getScoreFromAnswer();
        userScoreElt.textContent = userScore;

        if (currentUser != null) {
            // addScoreToDbUser(currentUser, userScore);
            await initializeUserList()
        }
    };

    const nextCountry = () => {
        countryToFind = getRandomCountry();
        countryToFindElt.textContent = countryToFind.name.common;
    };

    const nextCountryButtonEvent = () => {
        map.removeLayer(userMarker);
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

    const initializeUserList = async () => {
        await loadUserList();
        const tableElt = document.querySelector('.tableau-de-score tbody');
        tableElt.innerHTML = '';
        userList.forEach(user => {
            let userData = user.data();
            const trElt = document.createElement('tr');
            const tdNameElt = document.createElement('td');
            tdNameElt.textContent = userData.pseudo;
            trElt.appendChild(tdNameElt);
            const tdScoreElt = document.createElement('td');
            tdScoreElt.textContent = userData.score;
            trElt.appendChild(tdScoreElt);
            tableElt.appendChild(trElt);
        });
    };

    const inializeUserScore = () => {
        userScore = db.ref('users/' + currentUser.id + '/score');
    }

    const getScoreFromAnswer = () => {
        const distance = userMarker.getLatLng().distanceTo(answerMarker.getLatLng()) / 1000;
        console.log(distance);

        if (distance < 300) {
            return 100;
        } else if (distance > 2000) {
            return 0;
        }

        return 50; // temporaire
    };

    //#endregion

    //#region authentification

    const pseudoInput = document.querySelector('input#pseudo');
    const pseudoFormElt = document.querySelector('.pseudo-container');
    const connexionContainerElt = document.querySelector('.connected-container');
    const disconnectBtn = document.querySelector('.disconnect-btn');
    const userPseudoElt = document.querySelector('.user-pseudo');

    const updateDOMAfterAuth = () => {
        pseudoFormElt.setAttribute('hidden', true);
        connexionContainerElt.removeAttribute('hidden');
        userPseudoElt.textContent = currentUser.pseudo;
    };

    const updateDOMAfterDisconnect = () => {
        pseudoFormElt.removeAttribute('hidden');
        connexionContainerElt.setAttribute('hidden', true);
        userScoreElt.textContent = userScore;
    };

    const pseudoSubmitEvent = () => {
        currentUser = userList.find(user => user.data().pseudo === pseudoInput.value);

        if (currentUser !== undefined) {
            currentUser = currentUser.data();
            userScore = currentUser.score;
            userScoreElt.textContent = userScore;
            updateDOMAfterAuth();
        }
    };

    pseudoFormElt.addEventListener('submit', (event) => {
        event.preventDefault();
        pseudoSubmitEvent();
    });

    disconnectBtn.addEventListener('click', () => {
        userScore = 0;
        currentUser = null;
        updateDOMAfterDisconnect();
    });

    //#endregion

    await loadCountries();
    initializeMapBehaviour();
    initializeValiderButton();
    nextCountry();
    initializeUserList();
};

window.onload = async () => {
    await initializeGame();
};
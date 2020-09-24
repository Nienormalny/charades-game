/* === REQUIRES === */
require('./index.html');
require('firebase/app');
const moment = require('moment');
import minigameJSON from '../assets/json/minigame.json'
/* === IMPORTS === */
import * as firebase from 'firebase';
/* === GAME LOGIC === */
window.onload = () => {
    console.log('JS LODADED')
    var firebaseConfig = {
        apiKey: "AIzaSyDsyhzvw4Ht1B9_EIiucISX-zU4CPxuRp8",
        authDomain: "charades-game-4ff75.firebaseapp.com",
        databaseURL: "https://charades-game-4ff75.firebaseio.com",
        projectId: "charades-game-4ff75",
        storageBucket: "charades-game-4ff75.appspot.com",
        messagingSenderId: "240848150992",
        appId: "1:240848150992:web:5f9cd22eec2ff057fe99d5",
        measurementId: "G-MWCCRR6YYZ"
      };
      // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.database();
    const wordsBase = db.ref('words');
    const statistics = db.ref('statistics');
    const regexpArray = [
        /\w*(huj|pizda|kurwa|pojeb|jebaniec|popierdoleniec|popierdolony|chuj|chujek|penis|cipa|fiut|spierdolina|kurwik|kurwiszon|motherfucker|fucker|whore|hure|verfickte|matkojebca|pedal|pedał|zjeb|sukinsyn|suka|dziwka|kurewka|skurwiel|skurwysyn|fuggot|cock|pussy|fotze|schwanz|dupa|cwel|wyruchany|jebaka|pornhub|xvideos|youporn|porn|adult|xxx|fuck)\w*/i,
        /([^a-z ]([.0-9]))/g,
        /[^A-z\s\-\d][\\\^]?/g
    ];
    const settings = {
        generatedCategories: [],
        defaultCategoryText: 'naciśnij "wylosuj kategorie"',
        selectedCategory: '',
        generatedWord: 'naciśnij "wylosuj słowo"',
        selectedDuration: 0,
        interval: 1000,
        duration: 0,
        lastShowed: '',
        addNew: {
            selectedLang: '',
            slectedCat: '',
            selectedWord: ''
        },
        selectedLanguage: 'pl',
        onlineWords: false
    };
    let categoryTitle = document.getElementById('generated-category');
    let wordTitle = document.getElementById('generated-word');
    const getCategory = document.getElementById('get-category');
    const getWord = document.getElementById('get-word');
    const wordBox = document.getElementById('word');
    const timer = document.getElementById('timer');
    const customeTime = document.getElementById('custome-time');
    const next = document.getElementById('next');
    const startGameBtn = document.getElementById('start-game');
    const addNewWordBtn = document.getElementById('add-new-word');
    const onlineBtn = document.getElementById('online');
    const offlineBtn = document.getElementById('offline');
    const timeTitle = document.getElementById('time-title');
    const ownTimeTitle = document.getElementById('own-time-title');
    const saveTimeBtn = document.getElementById('save-time');
    const categoryBoxOptions = document.getElementById('cats-box');
    const wordBoxOptions = document.getElementById('word-box');
    const backBtn = document.getElementById('back');
    const catsOptions = document.getElementById('cats');
    const cardsBox = document.getElementById('cards-box');
    const navigationBox = document.getElementById('navigation');
    const newWordBox = document.getElementById('new-words-box');
    const languageBtn = document.querySelectorAll('.lang');
    const timerOptionsBox = document.querySelector('.timer-options');
    let langCatsArray = [];

    if (settings.online) {
        langCatsArray = [];
        wordsBase.once('value', snap => {
            _.mapKeys(snap.val().language[settings.selectedLanguage].category, (val, key) => {
                langCatsArray.push(key);
                settings.generatedCategories = langCatsArray;
            });
        });
    } else {
        langCatsArray = [];
        _.mapKeys(minigameJSON.language[settings.selectedLanguage].category, (val, key) => {
            langCatsArray.push(key);
            settings.generatedCategories = langCatsArray;
        });
    }

    let lastCategory = 0;
    let lastWord = 0;
    const getRandom = (number, category, word) => {
        const random = Math.floor(Math.random() * number);
        if (category && lastCategory !== random) {
            lastCategory = random
            settings.lastShowed = random;
            return lastCategory;
        } else if (word && lastWord !== random) {
            lastWord = random
            settings.lastShowed = random;
            return lastWord;
        } else {
            getRandom(number, category, word);
        }
        return category ? lastCategory : lastWord;
    }

    getCategory.addEventListener('click', event => {
        const randomNumber = getRandom(langCatsArray.length, true, false);
        const getRandomCategory = settings.generatedCategories[randomNumber];
        categoryTitle.innerText = getRandomCategory;
        settings.selectedCategory = getRandomCategory;
        categoryTitle.style.background = '#49d16d';
        categoryTitle.classList.add('selected');
        getCategory.classList.add('hidden');
        getWord.classList.remove('hidden');
        document.getElementById('word').classList.remove('hidden');
    }, true);

    let randomNumber = '';
    let randomWord = '';
    getWord.addEventListener('click', event => {
        if (settings.online) {
            wordsBase.on('value', snap => {
                console.log(snap.val(), snap.val().language[settings.selectedLanguage].category[settings.selectedCategory].length)
                if (snap.val() && snap.val().language[settings.selectedLanguage].category[settings.selectedCategory].length > 1) {
                    randomNumber = getRandom(snap.val().language[settings.selectedLanguage].category[settings.selectedCategory].length, false, true);
                    console.log(randomNumber, snap.val().language[settings.selectedLanguage].category[settings.selectedCategory][randomNumber])
                    randomWord = snap.val().language[settings.selectedLanguage].category[settings.selectedCategory][randomNumber];
                    wordTitle.innerText = randomWord;
                }
            });
        } else {
            randomNumber = getRandom(minigameJSON.language[settings.selectedLanguage].category[settings.selectedCategory].length, false, true);
            randomWord = minigameJSON.language[settings.selectedLanguage].category[settings.selectedCategory][randomNumber];
            wordTitle.innerText = randomWord;
        }
        console.log('randomWord', randomWord)
        wordTitle.style.background = '#49d16d';
        wordTitle.classList.add('selected');
        getWord.classList.add('hidden');
        timer.innerText = moment(settings.duration._data).format('mm:ss');
        timer.classList.remove('hidden');
        settings.duration = settings.selectedDuration;
        document.body.classList.add('game-started');
        const intervalCounter = setInterval(() => {
            if (settings.duration.seconds() !== 0 || settings.duration.minutes() !== 0) {
                settings.duration = moment.duration(settings.duration - settings.interval, 'milliseconds');
                timer.innerText = moment(settings.duration._data).format('mm:ss');
                timer.classList.remove('hidden');
            } else {
                clearInterval(intervalCounter);
                next.classList.remove('hidden');
                timer.classList.add('hidden');
                document.body.classList.remove('game-started');
            }
        }, settings.interval);
    }, true);

    document.querySelector('.time-btn').addEventListener('click', event => {
        const target = event.target;
        if (!_.isNil(target.dataset) && !_.isEmpty(target.dataset)) {
            settings.selectedDuration = moment.duration((parseFloat(target.dataset.time) * 60) * settings.interval, 'milliseconds');
            settings.duration = moment.duration((parseFloat(target.dataset.time) * 60) * settings.interval, 'milliseconds');
            cardsBox.classList.remove('hidden');
            document.querySelector('.timer-options').classList.add('hidden');
        }
    });
    document.getElementById('next').addEventListener('click', event => {
        wordBox.classList.add('hidden');
            wordTitle.innerText = settings.generatedWord;
            categoryTitle.innerText = settings.defaultCategoryText;
            getCategory.classList.remove('hidden');
            next.classList.add('hidden');
            categoryTitle.classList.remove('selected');
            categoryTitle.removeAttribute('style');
            wordTitle.classList.remove('selected');
            wordTitle.removeAttribute('style');
    });
    saveTimeBtn.addEventListener('click', event => {
        if (customeTime.value !== '' && new RegExp(/^(?:[3-9]|1[0-9]|20)/, 'gm').test(customeTime.value)) {
            settings.selectedDuration = moment.duration((parseFloat(customeTime.value) * 60) * settings.interval, 'milliseconds');
            settings.duration = moment.duration((parseFloat(customeTime.value) * 60) * settings.interval, 'milliseconds');
            cardsBox.classList.remove('hidden');
            timerOptionsBox.classList.add('hidden');
        } else {
            switch (settings.addNew.selectedLang) {
                case "en":
                    alert("Please, write correct number.");
                    break;
                case "de":
                    alert("Bitte, schreiben Sie korrekte Nummer");
                    break;
                case "pl":
                    alert("Proszę wpisać poprwaną wartość.");
                    break;
                default: alert("Proszę wpisać poprwaną wartość.");
            }
        }
    });
    startGameBtn.addEventListener('click', event => {
        document.getElementById('navigation').classList.add('hidden');
        timerOptionsBox.classList.remove('hidden');
    });
    _.map(languageBtn, lang => {
        lang.addEventListener('click', event => {
            const target = event.target;
            
            settings.addNew.selectedCat = '';
            if (!_.isEmpty(target.dataset)) {
                settings.addNew.selectedLang = target.dataset.language;
                settings.selectedLanguage = target.dataset.language;
                catsOptions.innerHTML = '';
                _.mapKeys(minigameJSON.language[settings.addNew.selectedLang].category, (cat, key) => {
                    catsOptions.innerHTML += `
                        <li class="category-option" data-cat="${key}">${key}</li>
                    `
                });
                categoryBoxOptions.classList.remove('hidden');
            }
            _.map(languageBtn, language => {
                if (language.dataset.language !== settings.addNew.selectedLang) {
                    language.classList.remove('selected');
                } else {
                    language.classList.add('selected');
                }
            });

            // TRANSLATE
            switch (settings.selectedLanguage) {
                case 'de':
                    startGameBtn.innerText = 'Spiel Starten';
                    addNewWordBtn.innerText = 'Neue wort hinzufügen';
                    timeTitle.innerText = 'Wählen Sie Zeit für Präsentation';
                    ownTimeTitle.innerText = 'Definieren Sie eigene Zeit';
                    saveTimeBtn.innerText = 'Speichern eigene Zeit';
                    customeTime.setAttribute('placeholder', 'VON 3 BIS 20 MIN');
                    document.getElementById('cat-title').innerText = 'Kategorie';
                    document.getElementById('word-title').innerText = 'Wort';
                    document.getElementById('game-title').innerText = 'Wortspiel';
                    document.getElementById('sel-lang').innerText = 'Wählen Sie Sprache';
                    document.getElementById('sel-cat').innerText = 'Wählen Sie Kategorie';
                    document.getElementById('write-word').innerText = 'Schreiben Sie Wort';
                    document.getElementById('save-new-word').innerText = 'Speichern Wort';
                    document.getElementById('online').innerText = 'Hasła online';
                    document.getElementById('offline').innerText = 'Hasła offline';
                    document.getElementById('name').setAttribute('placeholder', 'EIGENE WORT');
                    categoryTitle.innerText = 'Drücken Sie auf "Losen Kategorie Aus"';
                    getCategory.innerText = 'Losen Kategorie Aus';
                    wordTitle.innerText = 'Drücken Sie auf "Losen Wort Aus"';
                    getWord.innerText = 'Losen Wort Aus';
                    next.innerText = 'Nächste';
                    backBtn.innerText = 'Zurück';
                    break;
                case 'en':
                    startGameBtn.innerText = 'Start Game';
                    addNewWordBtn.innerText = 'Add new word';
                    timeTitle.innerText = 'Choose time for introduction';
                    ownTimeTitle.innerText = 'Define your own time';
                    saveTimeBtn.innerText = 'Save own time';
                    customeTime.setAttribute('placeholder', 'FROM 3 TO 20 MIN');
                    categoryTitle.innerText = 'Click on "draw a category"';
                    getCategory.innerText = 'Draw a category';
                    wordTitle.innerText = 'Click on "draw a word"';
                    getWord.innerText = 'Draw a word';
                    document.getElementById('cat-title').innerText = 'Category';
                    document.getElementById('word-title').innerText = 'Word';
                    document.getElementById('game-title').innerText = 'Charades game';
                    document.getElementById('sel-lang').innerText = 'Select language';
                    document.getElementById('sel-cat').innerText = 'Select Category';
                    document.getElementById('write-word').innerText = 'Write own Word';
                    document.getElementById('save-new-word').innerText = 'Save word';
                    document.getElementById('name').setAttribute('placeholder', 'OWN WORD');
                    next.innerText = 'Next';
                    backBtn.innerText = 'Back';
                    break;
                case 'pl':
                    startGameBtn.innerText = 'Graj';
                    addNewWordBtn.innerText = 'Dodaj nowe hasło';
                    timeTitle.innerText = 'Wybierz czas na pokazanie';
                    ownTimeTitle.innerText = 'Zdefiniuj własny czas';
                    saveTimeBtn.innerText = 'Zapisz własny czas';
                    customeTime.setAttribute('placeholder', 'OD 3 DO 20 MIN');
                    categoryTitle.innerText = 'Naciśnij "Wylosuj Kategorie"';
                    getCategory.innerText = 'Wylosuj Kategorie';
                    wordTitle.innerText = 'Naciśnij "Wylosuj Hasło"';
                    getWord.innerText = 'Wylosuj hasło';
                    document.getElementById('cat-title').innerText = 'Kategoria';
                    document.getElementById('word-title').innerText = 'Hasło';
                    document.getElementById('game-title').innerText = 'Kalambury';
                    document.getElementById('sel-lang').innerText = 'Wybierz język';
                    document.getElementById('sel-cat').innerText = 'Wybierz Kategorie';
                    document.getElementById('write-word').innerText = 'Wpisz własne hasło';
                    document.getElementById('save-new-word').innerText = 'Zapisz hasło';
                    document.getElementById('name').setAttribute('placeholder', 'WŁASNY WYRAZ');
                    next.innerText = 'Następny';
                    backBtn.innerText = 'Powrót';
                    break;
                default: {
                    startGameBtn.innerText = 'Graj';
                    addNewWordBtn.innerText = 'Dodaj nowe hasło';
                    timeTitle.innerText = 'Wybierz czas na pokazanie';
                    ownTimeTitle.innerText = 'Zdefiniuj własny czas';
                    saveTimeBtn.innerText = 'Zapisz własny czas';
                    customeTime.setAttribute('placeholder', 'OD 3 DO 20 MIN');
                    categoryTitle.innerText = 'Naciśnij "Wylosuj Kategorie"';
                    wordTitle.innerText = 'Naciśnij "Wylosuj Hasło"';
                    document.getElementById('cat-title').innerText = 'Kategoria';
                    document.getElementById('word-title').innerText = 'Hasło';
                    document.getElementById('game-title').innerText = 'Kalambury';
                    document.getElementById('sel-lang').innerText = 'Wybierz język';
                    document.getElementById('sel-cat').innerText = 'Wybierz Kategorie';
                    document.getElementById('write-word').innerText = 'Wpisz własne hasło';
                    document.getElementById('save-new-word').innerText = 'Zapisz hasło';
                    document.getElementById('name').setAttribute('placeholder', 'WŁASNY WYRAZ');
                    next.innerText = 'Następny';
                }
            }
            if (settings.online) {
                langCatsArray = [];
                wordsBase.once('value', snap => {
                    _.mapKeys(snap.val().language[settings.selectedLanguage].category, (val, key) => {
                        langCatsArray.push(key);
                        settings.generatedCategories = langCatsArray;
                    });
                });
            } else {
                langCatsArray = [];
                _.mapKeys(minigameJSON.language[settings.selectedLanguage].category, (val, key) => {
                    langCatsArray.push(key);
                    settings.generatedCategories = langCatsArray;
                });
            }
            // console.log(wordsBase.once('value', snap => snap.val() && snap.val().language[settings.selectedLanguage].category.length))
            
        });
    });
    addNewWordBtn.addEventListener('click', event => {
        newWordBox.classList.remove('hidden');
        navigationBox.classList.add('hidden');
        backBtn.classList.remove('hidden');
    });
    addEventListener('click', event => {
        const target = event.target;
        if (target.classList.contains('category-option')) {
            if (!_.isEmpty(target.dataset)) {
                settings.addNew.selectedCat = target.dataset.cat;
                target.classList.add('selected');
                wordBoxOptions.classList.remove('hidden');
                
                _.map(document.querySelectorAll('.category-option'), catOpt => {
                    if (catOpt.dataset.cat !== settings.addNew.selectedCat) {
                        catOpt.classList.remove('selected');
                    }
                });
            }
        }
        if (target.id === 'save-new-word') {
            const word = document.getElementById('name').value;
            // CATEGORY IS SELECTED
            if (settings.addNew.selectedCat === '') {
                switch (settings.addNew.selectedLang) {
                    case "en":
                        alert("Please, choose category.");
                        break;
                    case "de":
                        alert("Bitte, wählen Sie eine Kategorie");
                        break;
                    case "pl":
                        alert("Proszę wybrać kategorie.");
                        break;
                    default: alert("Proszę wybrać kategorie.");
                }
            }
            // MIN 3 LETTERS
            else if (word.length < 3) {
                switch (settings.addNew.selectedLang) {
                    case "en":
                        alert("Please, write a word with minimum 3 letters");
                        break;
                    case "de":
                        alert("Bitte, schreiben Sie ein Wort mit mindestens 3 Buchstaben");
                        break;
                    case "pl":
                        alert("Proszę napisac wyraz, który zawiera przynajmniej 3 litery.");
                        break;
                    default: alert("Proszę napisac wyraz, który zawiera przynajmniej 3 litery.");
                }
            }
            // MAX 50 LETTERS
            else if (word.length > 50) {
                switch (settings.addNew.selectedLang) {
                    case "en":
                        alert("Please, write a word with maximum 50 letters");
                        break;
                    case "de":
                        alert("Bitte, schreiben Sie ein Wort mit maximal 50 Buchstaben");
                        break;
                    case "pl":
                        alert("Proszę napisac wyraz, który zawiera maksymalnie 50 liter.");
                        break;
                    default: alert("Proszę napisac wyraz, który zawiera maksymalnie 50 liter.");
                }
            }
            // NOT NUMBER
            else if (regexpArray[1].test(word)) {
                switch (settings.addNew.selectedLang) {
                    case "en":
                        alert("Please, write a word.");
                        break;
                    case "de":
                        alert("Bitte, schreiben Sie ein Wort.");
                        break;
                    case "pl":
                        alert("Proszę napisac wyraz.");
                        break;
                    default: alert("Proszę napisac wyraz.");
                }
            }
            // NOT SPECIAL CHARACTERS
            else if (regexpArray[2].test(word)) {
                switch (settings.addNew.selectedLang) {
                    case "en":
                        alert("Please, write a word.");
                        break;
                    case "de":
                        alert("Bitte, schreiben Sie ein Wort.");
                        break;
                    case "pl":
                        alert("Proszę napisac wyraz.");
                        break;
                    default: alert("Proszę napisac wyraz.");
                }
            }
            // NOT BAD WORD
            else if (regexpArray[0].test(word)) {
                switch (settings.addNew.selectedLang) {
                    case "en":
                        alert("Please, write a correct word.");
                        break;
                    case "de":
                        alert("Bitte, schreiben Sie ein korrektes Wort.");
                        break;
                    case "pl":
                        alert("Proszę napisac poprawny wyraz.");
                        break;
                    default: alert("Proszę napisac poprawny wyraz.");
                }
            } else {
                wordsBase.once('value', snap => {
                    if (snap.val()) {
                        if (snap.val().language[settings.addNew.selectedLang]) {
                            if (!_.includes(snap.val().language[settings.addNew.selectedLang].category[settings.addNew.selectedCat], word)) {
                                wordsBase.child('language').set({
                                    ...snap.val().language,
                                    [settings.addNew.selectedLang]: {
                                        category: {
                                            ...snap.val().language[settings.addNew.selectedLang].category,
                                            [settings.addNew.selectedCat]: !_.isEmpty(snap.val().language[settings.addNew.selectedLang].category[settings.addNew.selectedCat]) ? [
                                                ...snap.val().language[settings.addNew.selectedLang].category[settings.addNew.selectedCat],
                                                word
                                            ] : [word]
                                        }
                                    }
                                });
                                switch (settings.addNew.selectedLang) {
                                    case "en":
                                        alert("Added new word to charades library.");
                                        break;
                                    case "de":
                                        alert("Das Wort ist im Wortspiel Bibliothek hinzugefügt.");
                                        break;
                                    case "pl":
                                        alert("Ten wyraz został poprawnie dodany do biblioteki kalambur.");
                                        break;
                                    default: alert("This word already exist.");
                                }
                            } else {
                                switch (settings.addNew.selectedLang) {
                                    case "en":
                                        alert("This word already exist.");
                                        break;
                                    case "de":
                                        alert("Das Wort existiert schon.");
                                        break;
                                    case "pl":
                                        alert("Ten wyraz już istnieje");
                                        break;
                                    default: alert("This word already exist.");
                                }
                            }
                        } else {
                            wordsBase.set({
                                language: {
                                    ...snap.val().language,
                                    [settings.addNew.selectedLang]: {
                                        category: {
                                            [settings.addNew.selectedCat]: [word]
                                        }
                                    }
                                }
                            });
                            switch (settings.addNew.selectedLang) {
                                case "en":
                                    alert("Added new word to charades library.");
                                    break;
                                case "de":
                                    alert("Das Wort ist im Wortspiel Bibliothek hinzugefügt.");
                                    break;
                                case "pl":
                                    alert("Ten wyraz został poprawnie dodany do biblioteki kalambur.");
                                    break;
                                default: alert("This word already exist.");
                            }
                        }
                    }
                });
            }
        }
        if (target.id === 'online') {
            langCatsArray = [];
            target.classList.add('selected');
            offlineBtn.classList.remove('selected');
            settings.online = true;
            wordsBase.once('value', snap => {
                _.mapKeys(snap.val().language[settings.selectedLanguage].category, (val, key) => {
                    langCatsArray.push(key);
                    settings.generatedCategories = langCatsArray;
                });
            });
        }
        if (target.id === 'offline') {
            langCatsArray = [];
            target.classList.add('selected');
            onlineBtn.classList.remove('selected');
            settings.online = false;
            _.mapKeys(minigameJSON.language[settings.selectedLanguage].category, (val, key) => {
                langCatsArray.push(key);
                settings.generatedCategories = langCatsArray;
            });
        }
    });
}
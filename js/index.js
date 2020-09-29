let paused = false;

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM Loaded")

    const COMICS_BASE_URL = "http://localhost:3000/comic_books/"
    const CHARACTER_BASE_URL = "http://localhost:3000/characters/"




    function startShowingComic(url) {
        if (!paused) {
            setInterval(async function() {
            if (!paused) {
            const response = await fetch(url + randomInt(1, 50));
            const json = await response.json();
            renderComic(json);}}, 3000);
        }
    }
    
    function randomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    function getRandomComic() {
        fetch(COMICS_BASE_URL + randomInt(1, 50))
        .then(resp => resp.json())
        .then(comic => {
            renderComic(comic)})
    }

    function getAllCharactersPanel(){
        fetch(CHARACTER_BASE_URL)
        .then(resp => resp.json())
        .then(characters => renderCharacterLeftPanel(characters))
    }

    function getAllComics() {
        fetch(COMICS_BASE_URL)
        .then(resp => resp.json())
        .then(comic => comic)
    }

    function getComic(comicId) {
        fetch(COMICS_BASE_URL + comicId)
        .then(resp => resp.json())
        .then(comic => renderComic(comic))
    }

    function getCharacter(characterId) {
        return fetch(CHARACTER_BASE_URL + characterId)
        .then(resp => resp.json())
    }

    function createCharacterObject(characterInfo) {
        const character = {
            id: characterInfo.id,
            name: characterInfo.name,
            description: characterInfo.description,
            image: characterInfo.image,
            comic_books: characterInfo.comic_books
        }
    }

    function renderComic(comic) {
        console.log(comic)
        const comicBookShow = document.querySelector(".comic-book-show")
        comicBookShow.id = "visible"
        const characterList = document.querySelector(".character-list");
        characterList.id = "hidden"
        characterList.innerHTML = ``
        const h1 = document.getElementById('title')
        h1.textContent = comic.title
        const averageRating = document.getElementById('average-rating')
        const image = document.getElementById('image')
        image.src = comic.image
        const description = document.getElementById('description')
        description.textContent = comic.description
        const reviewList = document.getElementById('reviews')
    };

    function renderCharacterLeftPanel(characters) {
        let ul = document.getElementById('panel-list')
        ul.innerHTML = ``
        const ulCharacters = document.getElementById('panel-list');
        for (const character of characters) {
            const characterLi = document.createElement('li');
            characterLi.classList.add("character-panel-list");
            characterLi.dataset.characterId = character.id;
            characterLi.innerHTML = `
            <a class="button" data-character-id=${character.id}>${character.name}</a>`
            ulCharacters.appendChild(characterLi);
        }
    };

    function renderComicLeftPanel(character) {
        let ul = document.getElementById('panel-list')
        ul.innerHTML = ``
        for (const comic of character.comic_books){
            const comicLi = document.createElement('li');
            comicLi.classList.add("comic-panel-list");
            comicLi.dataset.comicId = comic.id;
            comicLi.innerHTML = `
            <a class="button" data-comic-id=${comic.id}>${comic.title}</a>`
            ul.appendChild(comicLi);
        }
    };

    function renderAllCharacters() {
        fetch(CHARACTER_BASE_URL)
        .then(resp => resp.json())
        .then(characters => {
            const characterList = document.querySelector(".character-list");
            characterList.innerHTML = ``
            characters.forEach(character => renderCharacterInfo(character))
        })
    }

    const renderCharacterInfo = characterObj => {
        const characterList = document.querySelector(".character-list");
        characterList.id = "visible"
        newDiv = document.createElement('div')
        newDiv.innerHTML = `
            <h1 id="character-name">${characterObj.name}</h1>
            <img id="character-img" src="${characterObj.image}"></img>
            <p id="character-desc">${characterObj.description}</p>
        `
        characterList.appendChild(newDiv)
        let comicBookShow = document.querySelector(".comic-book-show")
        comicBookShow.id = "hidden"
    }
    
    
    const clickHandler = () => {
        document.addEventListener('click', e => {
            if (e.target.parentNode.matches(".character-panel-list")) {
                getCharacter(e.target.parentNode.dataset.characterId)
                .then(character => {
                    const characterList = document.querySelector(".character-list");
                    characterList.innerHTML = ``
                    renderCharacterInfo(character);
                    renderComicLeftPanel(character);
                    paused = true;
                })
            }
            if (e.target.matches("#comic-book-panel-list")) {
                getComic(e.target.dataset.comicId);
            }
            if (e.target.matches("#all-characters")) {
                let comicBookShow = document.querySelector(".comic-book-show")
                comicBookShow.id = "hidden"
                comicBookShow.innerHTML = ``

                renderAllCharacters();
                getAllCharactersPanel();
                paused = true;
            }
            if (e.target.matches("#random-comic")) {
                const characterList = document.querySelector(".character-list");
                characterList.innerHTML = ``
                let comicBookShow = document.querySelector(".comic-book-show")
                comicBookShow.id = "visible"
                getRandomComic();
                getAllCharactersPanel();
                paused = true;
            }
            if (e.target.matches("#home")) {
                const characterList = document.querySelector(".character-list");
                characterList.innerHTML = ``
                let comicBookShow = document.querySelector(".comic-book-show")
                comicBookShow.id = "visible"
                getAllCharactersPanel();
                paused = false;
            }
            if (e.target.matches(".main-panel")) {
                paused = true;
            }
            if (e.target.parentNode.matches(".comic-panel-list")) {
                getComic(e.target.parentNode.dataset.comicId)
            }
        })
    }

    const submitHandler = () => {
        document.addEventListener('submit', e => {
            e.preventDefault();
        })
    }

getAllCharactersPanel();
getRandomComic();
startShowingComic(COMICS_BASE_URL);
clickHandler();


})
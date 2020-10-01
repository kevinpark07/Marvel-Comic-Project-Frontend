let paused = false;

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM Loaded")

    const COMICS_BASE_URL = "http://localhost:3000/comic_books/"
    const CHARACTER_BASE_URL = "http://localhost:3000/characters/"
    const REVIEW_BASE_URL = "http://localhost:3000/reviews/"
    const searchBar = document.getElementById("searchBar");
    let marvelCharacters = [];


    function startShowingComic(url) {
        if (!paused) {
            setInterval(async function() {
            if (!paused) {
            const response = await fetch(url + randomInt(1, 50));
            const json = await response.json();
            renderComic(json);}}, 5000);
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
            resetComicShow();
            renderComic(comic)})
    }

    function getAllCharacters() {
        fetch(CHARACTER_BASE_URL)
        .then(resp => resp.json())
        .then(characters => {
            for(const character of characters ) {
                marvelCharacters.push(character)
            }  
        })
    }
    

    function getAllCharactersPanel() {
        fetch(CHARACTER_BASE_URL)
        .then(resp => resp.json())
        .then(characters => renderCharacterLeftPanel(characters))
    }

    function getAllComics() {
        fetch(COMICS_BASE_URL)
        .then(resp => resp.json())
    }

    function getComic(comicId) {
        fetch(COMICS_BASE_URL + comicId)
        .then(resp => resp.json())
        .then(comic => {
            resetComicShow()
            renderComic(comic)})
    }

    function getCharacter(characterId) {
        return fetch(CHARACTER_BASE_URL + characterId)
        .then(resp => resp.json())
    }

    function renderComic(comic) {
        const comicBookShow = document.querySelector(".comic-book-show");
        comicBookShow.id = "visible";
        const characterList = document.querySelector(".character-list");
        characterList.id = "hidden";
        characterList.innerHTML = ``;
        const h1 = document.getElementById('title');
        h1.textContent = comic.title;
        const image = document.getElementById('image');
        image.src = comic.image;
        const description = document.getElementById('description');
        description.textContent = comic.description;
        const reviewForm = document.querySelector("#review-form");
        reviewForm.dataset.comicId = comic.id;
        const reviewList = document.getElementById('reviews');
        reviewList.innerHTML = ``
        for(const review of comic.reviews) {
            let newLi = document.createElement('li')
            newLi.innerHTML = `
            <p id="review-comment">${review.comment}</p>
            <br>
            <span id="review-rating">Rating: ${review.rating}</span>
            <span id="review-commentor">${review.name}</span>
            `;
            reviewList.append(newLi)
        }
    }


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
            <a class="comic-button" data-comic-id=${comic.id}>${comic.title}</a>`
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

    function postReview(form) {
        const review = form.review.value;
        const rating = form.querySelector("div.rating");
        const comicRating = rating.dataset.ratingId;
        const name = form.name.value
        const comicId = form.dataset.comicId

        const options = {
            method: 'POST',
            headers: {
            "content-type" : "application/json",
            "accept" : "application/json"
            },
            body: JSON.stringify({
                comment: review,
                rating: comicRating,
                name: name,
                comic_book_id: comicId
            })
        }
        fetch(REVIEW_BASE_URL, options)
        .then(response => response.json())
        .then(review => {
            insertReview(review);
            form.reset();
        })
    }

    const insertReview = reviewObj => {
        const reviewUl = document.querySelector("#reviews");
        const reviewLi = document.createElement("li");
        reviewLi.dataset.reviewId = reviewObj.id;
        reviewLi.innerHTML = `
        <p id="review-comment">${reviewObj.comment}</p>
        <br>
        <span id="review-rating">Rating: ${reviewObj.rating}</span>
        <span id="review-commentor">${reviewObj.name}</span>
        `
        reviewUl.appendChild(reviewLi)
        
    }

    const renderCharacterInfo = characterObj => {
        const characterList = document.querySelector(".character-list");
        characterList.id = "visible"
        newDiv = document.createElement('div')
        newDiv.innerHTML = `
            <h1 id="character-name">${characterObj.name}</h1>
            <img id="character-img" data-character-id="${characterObj.id}" style="margin-top: 25px; box-shadow: 0px 0px 30px white;" src="${characterObj.image}"></img>
            <p id="character-desc">${characterObj.description}</p>
        `
        characterList.appendChild(newDiv)
        let comicBookShow = document.querySelector(".comic-book-show")
        comicBookShow.id = "hidden"
    }
    
    
    const clickHandler = () => {
        document.addEventListener('click', e => {
            if (e.target.parentNode.matches(".character-panel-list")) {
                let comicBookShow = document.querySelector(".comic-book-show")
                comicBookShow.innerHTML = ``
                comicBookShow.id = "hidden";
                getCharacter(e.target.parentNode.dataset.characterId)
                .then(character => {
                    const characterList = document.querySelector(".character-list");
                    characterList.innerHTML = ``
                    renderCharacterInfo(character);
                    renderComicLeftPanel(character);
                paused = true;
                })
            } else if (e.target.matches("#all-characters")) {
                let comicBookShow = document.querySelector(".comic-book-show")
                comicBookShow.id = "hidden";
                const comicInfo = document.querySelector('div.comic-info');
                comicBookShow.innerHTML = ``
                renderAllCharacters();
                getAllCharactersPanel();
                paused = true;
            } else if (e.target.matches("#random-comic")) {
                const characterList = document.querySelector(".character-list");
                characterList.innerHTML = ``
                let comicBookShow = document.querySelector(".comic-book-show")
                comicBookShow.id = "visible";
                getRandomComic();
                getAllCharactersPanel();
                paused = true;
            } else if (e.target.matches("#home")) {
                resetComicShow()
                getRandomComic();
                const characterList = document.querySelector(".character-list");
                characterList.innerHTML = ``
                let comicBookShow = document.querySelector(".comic-book-show");
                comicBookShow.id = "visible";
                getAllCharactersPanel();
                paused = false;
            } else if (e.target.matches(".main-panel")) {
                paused = true;
            } else if (e.target.matches("a.comic-button")) {
                comicId = e.target.dataset.comicId;
                getComic(comicId)
            } else if(e.target.matches(`[data-rating-id="5"]`)) {
                const rating = document.querySelector(".rating");
                rating.dataset.ratingId = e.target.dataset.ratingId
                if (e.target.textContent === "★") {
                    removeStar();
                } else {
                    e.target.textContent = "★";
                    e.target.style.color = "gold";
                    const four = e.target.nextElementSibling;
                    four.textContent = "★";
                    four.style.color = "gold";
                    const three = four.nextElementSibling;
                    three.textContent = "★";
                    three.style.color = "gold";
                    const two = three.nextElementSibling;
                    two.textContent = "★";
                    two.style.color = "gold";
                    const one = two.nextElementSibling;
                    one.textContent = "★";
                    one.style.color = "gold";
                }
            } else if(e.target.matches(`[data-rating-id="4"]`)) {
                const rating = document.querySelector(".rating");
                rating.dataset.ratingId = e.target.dataset.ratingId
                if (e.target.textContent === "★") {
                    removeStar();
                } else {
                e.target.textContent = "★";
                e.target.style.color = "gold";
                const three = e.target.nextElementSibling;
                three.textContent = "★";
                three.style.color = "gold";
                const two = three.nextElementSibling;
                two.textContent = "★";
                two.style.color = "gold";
                const one = two.nextElementSibling;
                one.textContent = "★";
                one.style.color = "gold";
                }
            } else if(e.target.matches(`[data-rating-id="3"]`)) {
                const rating = document.querySelector(".rating");
                rating.dataset.ratingId = e.target.dataset.ratingId
                if (e.target.textContent === "★") {
                    removeStar();
                } else {
                e.target.textContent = "★";
                e.target.style.color = "gold";
                const two = e.target.nextElementSibling;
                two.textContent = "★";
                two.style.color = "gold";
                const one = two.nextElementSibling;
                one.textContent = "★";
                one.style.color = "gold";
                }
            } else if(e.target.matches(`[data-rating-id="2"]`)) {
                const rating = document.querySelector(".rating");
                rating.dataset.ratingId = e.target.dataset.ratingId
                if (e.target.textContent === "★") {
                    removeStar();
                } else {
                e.target.textContent = "★";
                e.target.style.color = "gold";
                const one = e.target.nextElementSibling;
                one.textContent = "★";
                one.style.color = "gold";
                }
            } else if(e.target.matches(`[data-rating-id="1"]`)) {
                const rating = document.querySelector(".rating");
                rating.dataset.ratingId = e.target.dataset.ratingId
                if (e.target.textContent === "★") {
                    removeStar();
                } else {
                e.target.textContent = "★";
                e.target.style.color = "gold";
                }
            } else if (e.target.matches("#character-img")) {
                getCharacter(e.target.dataset.characterId)
                .then(character => {
                    const characterList = document.querySelector(".character-list");
                    characterList.innerHTML = ``
                    renderCharacterInfo(character);
                    renderComicLeftPanel(character);
                })
            }
        })
    }

    const removeStar = () => {
        const ratingDiv = document.querySelector('div.rating');
        ratingDiv.dataset.ratingId = 0
        ratingDiv.innerHTML = '';
        ratingDiv.innerHTML = `
            <span data-rating-id="5">☆</span>
            <span data-rating-id="4">☆</span>
            <span data-rating-id="3">☆</span>
            <span data-rating-id="2">☆</span>
            <span data-rating-id="1">☆</span>
        `
    }

    const submitHandler = () => {
        document.addEventListener('submit', e => {
            e.preventDefault();
            if (e.target.matches("#review-form")) {
                postReview(e.target)
                removeStar()
            }
            if (e.target.matches("#submit-search")) {
                paused = true;
                let searchedCharacter = marvelCharacters.filter(character => {
                    return character.name.includes(e.target.search.value)
                    });
                let characterId = searchedCharacter.map(character => {
                    return character.id
                })
                getCharacter(characterId)
                .then(character => {
                    const characterList = document.querySelector(".character-list");
                    characterList.innerHTML = ``
                    renderCharacterInfo(character);
                    renderComicLeftPanel(character);
                });
                resetComicShow();
            }
        })
    }

    getAllCharacters();
    getAllCharactersPanel();
    getAllComics();
    getRandomComic();
    startShowingComic(COMICS_BASE_URL);
    clickHandler();
    submitHandler();

    function resetComicShow() {
        const comicBookShow = document.querySelector(".comic-book-show");
        comicBookShow.innerHTML = `
        <div class="comic-info">
                <h1 id="title"></h1>
                <br>
                <img style="margin-top: 25px; box-shadow: 0px 0px 30px white;" id="image" src="">
                <p class="bubble bubble-bottom-left" id="description"></p>
            </div>
            <div class="review">
                <form id="review-form">
                    <h1 "add-review">Add a Review!</h1>
                    <input type="text" placeholder="Reviewer Name" name="name">
                    <br>
                    <br>
                    <textarea class="text-area" placeholder="Write Review Here"type="textarea" name="review"></textarea>
                    <br>
                    <br>
                    <div class="rating">
                        <span data-rating-id="5">☆</span>
                        <span data-rating-id="4">☆</span>
                        <span data-rating-id="3">☆</span>
                        <span data-rating-id="2">☆</span>
                        <span data-rating-id="1">☆</span>
                    </div>
                    <input id="review-button" type="submit" name="submit"/>
                </form>
                <ul id="reviews">
                </ul>
            </div>
        `
    }
})
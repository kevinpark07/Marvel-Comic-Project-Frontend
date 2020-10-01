let paused = false;

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM Loaded")
    NodeList.prototype.find = Array.prototype.find;

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
                let mazeDiv = document.querySelector(".maze-div")
                mazeDiv.innerHTML = ``
                getCharacter(e.target.parentNode.dataset.characterId)
                .then(character => {
                    const characterList = document.querySelector(".character-list");
                    characterList.innerHTML = ``
                    let mazeContainer = document.querySelector("maze-container")
                    mazeContainer = ``
                    renderCharacterInfo(character);
                    renderComicLeftPanel(character);
                paused = true;
                })
            } else if (e.target.matches("#all-characters")) {
                let comicBookShow = document.querySelector(".comic-book-show")
                comicBookShow.innerHTML = ``
                comicBookShow.id = "hidden";
                let mazeContainer = document.querySelector("maze-container")
                mazeContainer = ``
                let mazeDiv = document.querySelector(".maze-div")
                mazeDiv.innerHTML = ``
                renderAllCharacters();
                getAllCharactersPanel();
                paused = true;
            } else if (e.target.matches("#random-comic")) {
                const characterList = document.querySelector(".character-list");
                characterList.innerHTML = ``
                let mazeContainer = document.querySelector("maze-container")
                mazeContainer = ``
                let comicBookShow = document.querySelector(".comic-book-show")
                comicBookShow.id = "visible";
                let mazeDiv = document.querySelector(".maze-div")
                mazeDiv.innerHTML = ``
                getRandomComic();
                getAllCharactersPanel();
                paused = true;
            } else if (e.target.matches("#home")) {
                let mazeDiv = document.querySelector(".maze-div")
                mazeDiv.innerHTML = ``
                const characterList = document.querySelector(".character-list");
                characterList.innerHTML = ``
                let mazeContainer = document.querySelector("maze-container")
                mazeContainer = ``
                let comicBookShow = document.querySelector(".comic-book-show");
                comicBookShow.id = "visible";
                resetComicShow()
                getRandomComic();
                getAllCharactersPanel();
                paused = false;
            } else if (e.target.matches("a.comic-button")) {
                let mazeContainer = document.querySelector("maze-container")
                mazeContainer = ``
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
            } else if (e.target.matches("#image")) {
                paused ? (paused = false) : (paused = true)
            } else if (e.target.matches("#mini-game")) {
                getAllCharactersPanel();
                let comicBookShow = document.querySelector(".comic-book-show")
                comicBookShow.id = "hidden";
                comicBookShow.innerHTML = ``;
                let characterList = document.querySelector(".character-list")
                characterList.id = "hidden";
                characterList.innerHTML = ``;
                paused = true;
                if (document.querySelector(".maze-container")) {
                    let mazeDiv = document.querySelector(".maze-div")
                    mazeDiv.innerHTML = ``
                    currentPosition = { x: 1, y: 1}
                    createBlankMaze();
                    mazeRender();
                    renderShang(currentPosition);
                } else {
                createBlankMaze();
                mazeRender();
                currentPosition = {x: 1, y: 1}
                renderShang(currentPosition);
                }
            } else if (e.target.matches("#new-game")) {
                paused = true;
                document.querySelector(".maze-container")
                let mazeDiv = document.querySelector(".maze-div")
                mazeDiv.innerHTML = ``
                createBlankMaze();
                mazeRender();
                currentPosition = {x: 1, y: 1}
                renderShang(currentPosition); 
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
                let mazeDiv = document.querySelector(".maze-div")
                mazeDiv.innerHTML = ``
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

    const mazeMovements = () => {
        window.addEventListener('keyup', e => {
            if (e.key === "ArrowRight") {
              move("right")
            }
            else if (e.key === "ArrowLeft") {
              move("left")
            }
            else if (e.key === "ArrowUp") {
              move("up")
            }
            else if (e.key === "ArrowDown") {
              move("down")
            }
        })
    }

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

    var currentPosition;

    let mazeWidth = 10;
    let mazeHeight = 10;
    function createBlankMaze() {
        let mazeTitle = document.createElement('h1')
        mazeTitle.textContent = "Get Shang-Chi to the Rings!"
        let rowIndex, colIndex;
        let table = document.createElement("table");
        let tbody = document.createElement("tbody");
        table.className = "maze-container"
        tbody.id = "maze-table"
        table.cellSpacing = 1;

        for (rowIndex = 1; rowIndex <= mazeHeight; rowIndex++) {
            let row = document.createElement("tr");
            for (colIndex = 1; colIndex <= mazeWidth; colIndex++) {
                let col = document.createElement("td");
                col.style.width = "90px"
                col.style.height = "90px"
                col.setAttribute("data-x", colIndex)
                col.setAttribute("data-y", rowIndex)
                col.style.borderWidth = "1px"
                col.style.borderColor = "black";
                col.style.borderStyle = "solid";
                col
                if (rowIndex == 1 && colIndex == 1 ) {
                    col.setAttribute("type", "start");
                } else if (rowIndex == mazeHeight && colIndex == mazeWidth) {
                    col.innerHTML = `<img id="maze-end" src="https://ak.picdn.net/shutterstock/videos/24102934/thumb/1.jpg">`
                    col.style.backgroundColor = "rgb(0,0,0)";
                    col.setAttribute("type", "finish");
                } else {
                    col.style.backgroundColor = "rgb(255,255,255)";
                }
                col.setAttribute("id", "cell_" + rowIndex + "_" + colIndex)
                col.setAttribute("class", "tile")
                row.appendChild(col);
            }
            tbody.appendChild(row);
        }
        newGameBtn = document.createElement('button')
        newGameBtn.textContent = "New Game"
        newGameBtn.id = "new-game"
        table.appendChild(tbody);
        mazeDiv = document.querySelector(".maze-div")
        mazeDiv.appendChild(mazeTitle)
        mazeDiv.appendChild(table)
        mazeDiv.appendChild(newGameBtn)
    }


    function mazeRender() {
        let startAtRow = 1;
        let startAtCol = 1;
        let currentCell;
        addRoute(startAtRow, startAtCol, false, "rgb(255, 255, 255)");

        for (n = 1; n < (mazeWidth * mazeHeight) - 1; n++) {
            let currentCell = document.getElementById("cell_" + startAtRow + "_" + startAtCol);
            if (currentCell.getAttribute("occupied") == "true") {
                addRoute(startAtRow, startAtCol, true, "white");
            }
            if (startAtCol == mazeWidth) {
                startAtRow++;
                startAtCol = 1;
            } else {
                startAtCol++;
            }
        }
    }
    function addRoute(startAtRow, startAtCol, createDetour, backgroundColorRoute) {
        let validExits = ["right", "bottom", "left", "top"];
        let remainingExits = {"right": mazeWidth, "bottom": mazeHeight, "left": 0, "top": 0};	
        let nextExits = [];
        let lastCells= [];
        let rowIndex = startAtRow;
        let colIndex = startAtCol;
        let currentCell = document.getElementById("cell_" + rowIndex + "_" + colIndex);
        let exit;
        let lastExit;
        let exitIndex;
        let loop = 0;
        let loopFuse = 0;
        let maxLoops = 3 * mazeWidth * mazeHeight;
        let nextPossibleCell;
        while (loop < ((mazeWidth * mazeHeight) - 1)) {
            loopFuse++;
            if (loopFuse >= maxLoops) {break;}
            nextExits = [];
            for (i = 0; i < validExits.length; i++) {
                switch(validExits[i]) {
                    case "right":
                        nextPossibleCell = document.getElementById("cell_" + rowIndex + "_" + (colIndex + 1));
                        break;
                    case "left":
                        nextPossibleCell = document.getElementById("cell_" + rowIndex + "_" + (colIndex - 1));
                        break;
                    case "bottom":
                        nextPossibleCell = document.getElementById("cell_" + (rowIndex + 1) + "_" + colIndex);
                        break;
                    case "top":
                        nextPossibleCell = document.getElementById("cell_" + (rowIndex - 1) + "_" + colIndex);
                        break;
                }
                if (nextPossibleCell != null) {
                    if (nextPossibleCell.getAttribute("occupied") != "true") {
                        for (t = 0; t < remainingExits[validExits[i]]; t++) {
                            nextExits.push(validExits[i]);
                        }
                    }
                } 
            }
            if (nextExits.length == 0) {
                if (createDetour == true) {
                    return false;
                } else {
                    lastCells.splice(lastCells.length - 1, 1);
                    rowIndex = lastCells[lastCells.length - 1][0];
                    colIndex = lastCells[lastCells.length - 1][1];
                    currentCell = document.getElementById("cell_" + rowIndex + "_" + colIndex);
                    continue;
                }
            } 
            exitIndex = Math.floor(Math.random() * Math.floor(nextExits.length));
            exit = nextExits[exitIndex];
            if (createDetour == false) {
                currentCell.style["border-"+exit] = "none";
            } else {
                if (!(exit == "right" && colIndex == mazeWidth - 1 && rowIndex == mazeHeight) &&
                    !(exit == "bottom" && colIndex == mazeWidth && rowIndex == mazeHeight - 1) ) {
                    currentCell.style["border-"+exit] = "none";
                }
            }
            switch(exit) {
                case "right":
                    colIndex = colIndex + 1;
                    remainingExits.left++;
                    remainingExits.right--;
                    break;
                case "bottom":
                    rowIndex = rowIndex + 1;
                    remainingExits.top++;
                    remainingExits.bottom--;
                    break;
                case "left":
                    colIndex = colIndex - 1;
                    remainingExits.left--;
                    remainingExits.right++;
                    break;
                case "top":
                    rowIndex = rowIndex - 1;
                    remainingExits.top--;
                    remainingExits.bottom++;
                    break; 
            }
            lastCells.push([rowIndex, colIndex]);
            currentCell = document.getElementById("cell_" + rowIndex + "_" + colIndex);
            switch(exit) {
                case "right":
                    currentCell.style["border-left"] = "none";
                    break;
                case "bottom":
                    currentCell.style["border-top"] = "none";
                    break;
                case "left":
                    currentCell.style["border-right"] = "none";
                    break;
                case "top":
                    currentCell.style["border-bottom"] = "none";
                    break;
            }
            if (rowIndex == mazeHeight && colIndex == mazeWidth) {
                break;
            }
            currentCell.style.backgroundColor = backgroundColorRoute;
            currentCell.setAttribute("occupied", "true");
            lastExit = exit;
            loop++;
        }
    }

    let prevTile;

    function renderShang(targetPosition){
        const tiles = document.querySelectorAll(".tile")
        const newTile = tiles.find(tile => {
          return (parseInt(tile.dataset.x) === targetPosition.x) && (parseInt(tile.dataset.y) === targetPosition.y)
        })
        if (!newTile) {
            alert("STAY IN BOUNDS")
            return false
        } else {
            prevTile = tiles.find(tile => {
                return (parseInt(tile.dataset.x) === currentPosition.x) && (parseInt(tile.dataset.y) === currentPosition.y)
          })
        }

        prevTile.innerHTML = ``
    
        newTile.innerHTML = `<img id="shang-chi" src="https://pm1.narvii.com/7055/f113ec31d719b844166d519f746ad368f864e7e5r1-1200-1200v2_128.jpg">`
        if (newTile.id === "cell_10_10") {
            alert("You got the rings!")
        }

        return true
    }

    function move(direction){
        let x = currentPosition.x;
        let y = currentPosition.y;
        switch(direction){
          case "left":
            x--
            break;
          case "right":
            x++
            break;
          case "up":
            y--
            break;
          case "down":
            y++
            break;
        }
        const moved = renderShang({ x, y })
        if (moved){
          currentPosition = { x, y }
        }
    }
    getAllCharacters();
    getAllCharactersPanel();
    getAllComics();
    getRandomComic();
    startShowingComic(COMICS_BASE_URL);
    clickHandler();
    submitHandler();
    mazeMovements();
})
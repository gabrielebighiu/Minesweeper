let gameBoard = document.getElementById("gameBoard");
let gameUpdateText = document.getElementById("gameText");

// Gameboard Characteristics
let gameBoardSize;
let board = [];
let clickedBoxesCount = 0;

let nrOfBombs;
let bombCoordinates = [];

let flaggedCoordonates = [];

// Used to correct board size for medium and hard game modes
let boardDiff = 0;

// Game modes and event listeners for buttons
let easyMode = document.getElementById("easy");
easyMode.addEventListener("click", startGame);
let mediumMode = document.getElementById("medium");
mediumMode.addEventListener("click", startGame);
let hardMode = document.getElementById("hard");
hardMode.addEventListener("click", startGame);

// Disables the browser's right-click menu
window.addEventListener("contextmenu", e => e.preventDefault());

function startGame() {
    // Sets the game mode
    if (this.id == "easy") {
        gameBoardSize = 10;
        nrOfBombs = 10;
    } else if (this.id == "medium") {
        gameBoardSize = 17;
        nrOfBombs = 40;
        boardDiff = 14;
    } else {
        gameBoardSize = 25;
        nrOfBombs = 70;
        boardDiff = 30;
    }
    // Calls the function that creates the game board
    createGameBoard();

    // Removes the text and game mode buttons
    gameUpdateText.innerHTML = "<br>";
    easyMode.remove();
    mediumMode.remove();
    hardMode.remove();

    // Creates button allowing user to change the game difficutly
    let changeGameModeBtn = document.createElement("button");
    changeGameModeBtn.innerText = "Change Game Mode";
    changeGameModeBtn.className = "btn btn-outline-light";
    changeGameModeBtn.onclick = function () {
        location.reload();
    }
    document.getElementById("gameSettings").appendChild(changeGameModeBtn);
}

function createGameBoard() {
    // Sets board CSS elements
    gameBoard.style.width = (gameBoardSize * 32 - boardDiff) + "px";
    gameBoard.style.height = (gameBoardSize * 32 - boardDiff) + "px";
    gameBoard.style.border = "10px solid rgb(90, 89, 89)";
    document.getElementById("game").append(gameBoard);

    // Inserts boxes as <div> inside the grid
    for (let row = 0; row < gameBoardSize; ++row) {
        let filledRow = [];
        for (let col = 0; col < gameBoardSize; ++col) {
            let box = document.createElement("div");
            box.id = row.toString() + "-" + col.toString();
            box.addEventListener("contextmenu", checkFlagCoordinates);
            box.addEventListener("click", clickedBox);
            gameBoard.appendChild(box);
            filledRow.push(box);
        }
        board.push(filledRow);
    }
    setBombs();
}

function setBombs() {
    let bombs = nrOfBombs;
    
    while (bombs > 0) {
        let row = Math.floor(Math.random() * gameBoardSize);
        let col = Math.floor(Math.random() * gameBoardSize);
        let boxID = row.toString() + "-" + col.toString();
        
        if (!bombCoordinates.includes(boxID)) {
            bombCoordinates.push(boxID);
            bombs -= 1;
        }
    }
}

// When a bomb is clicked and the game is over all mines get displayed
function displayBombs() {
    for (let row = 0; row < gameBoardSize; ++row) {
        for (let col = 0; col < gameBoardSize; ++col) {
            let box = board[row][col];
            if (bombCoordinates.includes(box.id)) {
                let bomb = document.createElement("img");
                bomb.src = "Images/Bomb.gif";
                bomb.height = 20;
                box.innerHTML = "";
                box.style.backgroundColor = "red";
                box.appendChild(bomb);
            }
        }
    }
}

// Checks to see if box is already flagged
function checkFlagCoordinates() {
    if (this.classList.contains("clicked-box")) {
        return;
    }
    // If box is already flagged it deletes the flag
    for (let i = 0; i < flaggedCoordonates.length; ++i) {
        if (this.id == flaggedCoordonates[i]) {
            flaggedCoordonates.splice(i, 1);
            this.innerHTML = "";
            return;
        }
    }
    // If box is not flagged it gets flagged
    flaggedCoordonates.push(this.id);
    let flag = document.createElement("img");
    flag.src = "Images/Flag.png";
    flag.height = 25;
    this.appendChild(flag);
    this.removeEventListener();
}

function clickedBox() {
    if (this.classList.contains("clicked-box") || flaggedCoordonates.includes(this.id)) {
        return;
    }
    if (bombCoordinates.includes(this.id)) {
        displayBombs();
        gameUpdateText.innerHTML = "GAME OVER!"
        gameBoard.style.pointerEvents = "none";
        return;
    }

    let boxCoords = this.id.split("-");
    let row = parseInt(boxCoords[0]);
    let col = parseInt(boxCoords[1]);
    checkBox(row, col);
}

function checkBox(row, col) {
    if (row < 0 || row >= gameBoardSize || col < 0 || col >= gameBoardSize) {
        return;
    }
    if (board[row][col].classList.contains("clicked-box")) {
        return;
    }

    ++clickedBoxesCount;
    board[row][col].classList.add("clicked-box");

    let bombsFound = 0;

    // Checks for mines around the clicked box
    // Top 3
    bombsFound += checkForBombs(row - 1, col - 1);
    bombsFound += checkForBombs(row - 1, col);
    bombsFound += checkForBombs(row - 1, col + 1);

    // Left & Right
    bombsFound += checkForBombs(row, col - 1);
    bombsFound += checkForBombs(row, col + 1);

    // Bottom 3
    bombsFound += checkForBombs(row + 1, col - 1);
    bombsFound += checkForBombs(row + 1, col);
    bombsFound += checkForBombs(row + 1, col + 1);

    if (bombsFound > 0) {
        board[row][col].innerHTML = bombsFound;
    } else {
        // Checks if adjacent boxes have mines around them
        // Top 3
        checkBox(row - 1, col - 1);
        checkBox(row - 1, col);
        checkBox(row - 1, col + 1);

        // Left & Right
        checkBox(row, col - 1);
        checkBox(row, col + 1);

        // Bottom 3
        checkBox(row + 1, col - 1);
        checkBox(row + 1, col);
        checkBox(row + 1, col + 1);
    }

    checkForWin();
}

function checkForBombs(row, col) {
    if (row < 0 || row >= gameBoardSize || col < 0 || col >= gameBoardSize) {
        return 0;
    }
    if (bombCoordinates.includes(row.toString() + "-" + col.toString())) {
        return 1;
    }
    return 0;
}

function checkForWin() {
    if (clickedBoxesCount == (gameBoardSize * gameBoardSize) - nrOfBombs) {
        gameUpdateText.innerHTML = "YOU WIN!"
    }
}

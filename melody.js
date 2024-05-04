/**
 * Name: Allam Amzad
 * CS 132 Spring 2024
 * Email: aamzad@caltech.edu
 * Date: 4/28/2024
 * 
 * This melody.js file implements the functionality for the Melody Rush
 * game. Functions encompass handling menu options, adding keys to the
 * game board, receiving keyboard input, updating game parameters 
 * (scores, lives, combos), and all other miscellaneous components 
 * of the Melody Rush game.
 */

(function() {
    "use strict";

    // Stores all the keys that are currently on the game board
    let allKeys = [];

    // Initializes the buttons on the Melody Rush menu page and popups.
    function init() {
        // Checks if a valid key was pressed (up, left, right, down).
        window.addEventListener("keydown", (event) => {
            checkKeyPressed(event);
        });
        // Reloads the window to reset all game conditions if back to menu is clicked.
        let backButtons = qsa(".back-btn");
        for (let i = 0; i < backButtons.length; i++) {
            backButtons[i].addEventListener("click", function () {
                window.location.reload();
            });
        }
        qs("#mute-btn").addEventListener("click", toggleSound);
        qs("#difficulty-warn-btn").addEventListener("click", displayDifficultyWarning);
        qs("#start-btn").addEventListener("click", setDifficulty);
    }

    // Displays warning if difficulty isn't set, otherwise starts the game.
    function setDifficulty() {
        // Removes the alert telling players to select a difficulty or the old difficulty.
        if (qs("select").value === "choose-difficulty") {
            displayDifficultyWarning();
        } else {
            toggleView();
        }
    }

    // Displays a popup indicating that the player did not select a difficulty.
    function displayDifficultyWarning() {
        qs("#difficulty-section").classList.toggle("hidden");
        qs("#menu-view").classList.toggle("hidden");
        qs("footer").classList.toggle("hidden");
    }

    // Toggles between the menu view (includes footer) and game view, then starts the game.
    function toggleView() {
        qs("#game-view").classList.toggle("hidden");
        qs("#menu-view").classList.toggle("hidden");
        qs("footer").classList.toggle("hidden");

        const args = setDifficultyParameters();
        const maxSpeed = args[0];
        const updateSpeed = args[1];
        const initialSpeed = args[2];
        startGame(maxSpeed, initialSpeed, updateSpeed);
    }

    /**
     * Sets the initial speed of adding/moving keys, the update factor
     * for increasiming speed, and the fastest speed. Parameters depend
     * on the four difficulities: easy, medium, hard, and impossible.
     * If no difficulty is chosen, the default is easy.
     * @return {Number Array} The parameters of the chosen difficulty.
     */
    function setDifficultyParameters() {
        const difficulty = qs("select").value;
        const easyMaxSpeed = 0.94;
        const easyUpdateSpeed = 0.003;
        const easyInitialSpeed = 1;
        switch (difficulty) {
            case "easy": 
                return [easyMaxSpeed, easyUpdateSpeed, easyInitialSpeed];
            case "medium": {
                const mediumMaxSpeed = 0.90;
                const mediumUpdateSpeed = 0.005;
                const mediumInitialSpeed = 1;
                return [mediumMaxSpeed, mediumUpdateSpeed, mediumInitialSpeed];
            }
            case "hard": {
                const hardMaxSpeed = 0.85;
                const hardUpdateSpeed = 0.007;
                const hardInitialSpeed = 0.95;
                return [hardMaxSpeed, hardUpdateSpeed, hardInitialSpeed];
            }
            case "impossible": {
                const impossibleMaxSpeed = 0.80;
                const impossibleUpdateSpeed = 0.01;
                const impossibleInitialSpeed = 0.90;
                return [impossibleMaxSpeed, impossibleUpdateSpeed, impossibleInitialSpeed];
            }
        }
    }

    /**
     * Starts running all components of the game. This includes adding keys, 
     * checking if keys go offscreen, adjusting key speed over time, and
     * more.
     * @param {Number} initialSpeed - scaling factor ranging from 0.8 to 1 controlling how often 
     *                                moveKeys should be called (lower -> faster key movement).
     * @param {Number} maxSpeed - the fastest that keys can be added and moved on the game board.
     * @param {Number} updateSpeed - update factor for increasing the speed of 
     *                               adding and moving keys.
     */
    function startGame (maxSpeed, initialSpeed, updateSpeed) {
        const refreshRate = 10000; // The rate at which to update key speed.
        const speedUpdateInfo = increaseKeySpeed([], initialSpeed, maxSpeed, updateSpeed);
        setInterval(increaseKeySpeed, refreshRate, speedUpdateInfo[0], 
                    speedUpdateInfo[1], maxSpeed, updateSpeed);
        setInterval(checkKeyOffscreen, 1);
        setInterval(removeKeyPressAudios, refreshRate);
    }

    /**
     * Updates the speed of which to add and move keys to the game board.
     * @param {Number} allTimers - stores the intervals of which to call addKeyToBoard 
     *                             and moveKeys.
     * @param {Number} speed - scaling factor ranging from 0.8 to 1 controlling how often 
     *                                moveKeys should be called (lower -> faster key movement).
     * @param {Number} maxSpeed - the fastest that keys can be added and moved on the game board.
     * @param {Number} updateSpeed - update factor for increasing the speed of 
     *                               adding and moving keys.
     * @return {Array} - array containing the array of setIntervals and the current speed.
     */
    function increaseKeySpeed(allTimers, speed, maxSpeed, updateSpeed) {
        const keyAddFactor = 3000;
        const moveKeysFactor = 10;
        if (speed > maxSpeed) {
            speed -= updateSpeed;
            if (allTimers.length > 0) {
                /* Clears the existing addKeyToBoard and moveKeys intervals. */
                clearInterval(allTimers[0]);
                clearInterval(allTimers[1]);
            }
            /* Keeps track of the most current addKeyToBoard and moveKeys intervals. */
            allTimers.push(setInterval(addKeyToBoard, speed * keyAddFactor));
            allTimers.push(setInterval(moveKeys, speed * moveKeysFactor));
        }
        return [allTimers, speed];
    }

    // Adds a randomly chosen arrow key to the game board.
    function addKeyToBoard() {
        const nextKey = findNextKey();
        const nextKeyImg = gen("img");
        nextKeyImg.classList.add(nextKey + "-key");
        nextKeyImg.src = "media/" + nextKey + ".png";
        nextKeyImg.alt = nextKey + "-key";
        const nextKeyDiv = gen("div");
        nextKeyDiv.classList.add("key-container");
        nextKeyDiv.appendChild(nextKeyImg);
        const nextKeyRow = qs("#" + nextKey + "-key-row");
        if (nextKeyRow.hasChildNodes()) {
            nextKeyRow.insertBefore(nextKeyDiv, nextKeyRow.childNodes[0]);
        } else {
            nextKeyRow.appendChild(nextKeyDiv);
        }
        allKeys.push(nextKey);
    }

    /**
     * Randomly chooses the next arrow key to add to the game board.
     * @return {String} The next key to be placed on the game board.
     */
    function findNextKey() {
        // Each arrow key has an equal, 25% chance of being chosen. 
        const probability = Math.random();
        let key = "down";
        if (probability < 0.25) {
            key = "left";
        } else if (probability < 0.50) {
            key = "right";
        } else if (probability < 0.75) {
            key = "up";
        }
        return key;
    }

    /**
     * Moves all keys on the gameboard by 1 pixel. Called by the function
     * increaseKeySpeed every 10 * initialSpeed milliseconds. Implementation
     * inspired by: Source: https://www.w3schools.com/howto/howto_js_animate.asp, 
     * Author: W3 Schools, [CC BY-SA 3.0 (http://creativecommons.org/licenses/by-sa/3.0/)]
     */
    function moveKeys() {
        const keyContainers = qsa(".key-container");
        for (let i = 0; i < keyContainers.length; i++) {
            let leftPos = keyContainers[i].style.left;
            if (leftPos === "") {
                leftPos = "0px";
            }
            const curPosPixels = parseInt(leftPos.substring(0, leftPos.length - 2));
            keyContainers[i].style.left = (curPosPixels + 1).toString() + "px";
        }
    }

    /**
     * Removes a key if it goes past the music bar where users can press the key.
     * Resets combo and removes a life is key is missed. Checking if key is past
     * music bar was inspired by:
     * Source: https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect,
     * Author: Mozilla, [CC BY-SA 3.0 (http://creativecommons.org/licenses/by-sa/3.0/)]
     */
    function checkKeyOffscreen() {
        const barDims = qs("#music-bar").getBoundingClientRect();
        if (allKeys.length > 0) {
            const keyElements = qs("#" + allKeys[0] + "-key-row");
            const rightmostKey = keyElements.childNodes[keyElements.childNodes.length - 1];
            const rightmostKeyDims = rightmostKey.getBoundingClientRect();
            if (rightmostKeyDims["left"] >= barDims["right"]) {
                decrementLife();
                resetCombo();
                allKeys.shift();
                rightmostKey.remove();
            }
        }
    }

    // Resets the combo when a key is missed.
    function resetCombo() {
        let combo = qs("#combo");
        combo.textContent = "Combo: 0x";
    }

    // Increases the player combo by 1. Called when the player presses a key on time.
    function incrementCombo() {
        const comboFrontTextLength = 7;
        const combo = qs("#combo");
        const comboText = combo.textContent;
        const newCombo = parseInt(comboText.substring(comboFrontTextLength, 
                                                      comboText.length - 1)) + 1;
        const newComboText = "Combo: " + newCombo.toString() + "x";
        combo.textContent = newComboText;
    }

    /**
     * Decrements the player's life. Called when the player misses a key.
     * If 0 lives remain, an alert notifies the player that they lost.
     */
    function decrementLife() {
        const lifeTextLength = 6;
        const life = qs("#lives");
        const lifeText = life.textContent;
        const newLife = parseInt(lifeText.substring(lifeTextLength, lifeText.length)) - 1;
        const newLifeText = "Life: " + newLife.toString();
        life.textContent = newLifeText;
        if (newLife === 0) {
            displayLoseScreen();
        }
    }

    // Displays a "You Lose" popup when the player runs out of lives. 
    function displayLoseScreen() {
        qs("#game-view").classList.toggle("hidden");
        qs("#lose-section").classList.toggle("hidden");
    }

    // Increments the score by 100. Called when the player presses a key on time.
    function incrementScore() {
        const scoreTextLength = 7;
        const scoreIncrement = 100;
        const score = qs("#score");
        const scoreText = score.textContent;
        const newScore = scoreIncrement + parseInt(scoreText.substring(scoreTextLength, 
                                                                       scoreText.length));
        const newScoreText = "Score: " + newScore.toString();
        score.textContent = newScoreText;
    }

    // Mutes or unmutes all keypresses.
    function toggleSound() {
        qs("#mute-btn").classList.toggle("muted");
    }

    // Removes audio tags from the #game-board section.
    function removeKeyPressAudios() {
        const allKeyPresses = qsa("audio");
        for (let i = 0; i < allKeyPresses.length; i++) {
            allKeyPresses[i].remove();
        }
    }

    // Plays a keypress sound. Called when a user presses a key on time.
    function playKeyPressSound() {
        const isMuted = qs("#mute-btn").classList.contains("muted");
        if (!isMuted){
            const keyPressAudio = gen("audio");
            keyPressAudio.src = "media/keypress.mp3";
            keyPressAudio.autoplay = true;
            qs("#sounds").appendChild(keyPressAudio);
        }
    }

    /**
     * Checks if a key is overlapping with the music bar object.
     * @return {Boolean} True if the given key overlaps with the music bar. False otherwise.
     */
    function checkMusicBarOverlap(key) {
        const barDims = qs("#music-bar").getBoundingClientRect();
        const keyDims = key.getBoundingClientRect();
        if ((keyDims["right"] >= barDims["left"]) || (keyDims["left"] >= barDims["right"])) {
            return true;
        }
        return false;
    }

    /**
     * Checks if they key furthest right satisfies the conditions to be removed from
     * the game board, and removes the key if it does. The condition is that the
     * key pressed by the user corresponds to the key furthest to the right of the game
     * board, and that the key overlaps with the music bar. Update score, plays keypress
     * sound, and increases combo if key is removed.
     * @return {Boolean} True if the key is removed. False otherwise.
     */
    function attemptRemoveKey(key) {
        if (allKeys.length > 0 && allKeys[0] === key) {
            const keyElements = qs("#" + key + "-key-row");
            const lastKey = keyElements.childNodes[keyElements.childNodes.length - 1];
            if (checkMusicBarOverlap(lastKey)) {
                playKeyPressSound();
                incrementScore();
                incrementCombo();
                allKeys.shift();
                lastKey.remove();
                return true;
            }
        }
        return false;
    }

    /**
     * Checks which key the user pressed and if it is a valid arrow key, checks
     * if a key on the game board should be removed.
     * @return {Boolean} True if a key is removed. False otherwise.
     */
    function checkKeyPressed(e) {
        switch (e.key) {
            case "ArrowDown":
                return attemptRemoveKey("down");
            case "ArrowUp":
                return attemptRemoveKey("up");
            case "ArrowLeft":
                return attemptRemoveKey("left");
            case "ArrowRight":
                return attemptRemoveKey("right");
            default:
                return false;
        }
    }

    init();
})();

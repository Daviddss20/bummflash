import {emojis, maps} from './maps.mjs'
import {player} from './player.mjs'

const canvas = document.querySelector('#game-canvas')
const game = canvas.getContext('2d')
const selectedMap = localStorage.getItem('selectedMap')

let map = maps[selectedMap]['levels']
let maxLevel = map.length
let currentLevel = 0
let levelElements
let gameStarted = false
let canvasSize
let elementsSize
let audioGame

// Sunds
const sounds = {
    meltedSounds: [
        './assets/audio/melted01.ogg',
        './assets/audio/melted02.ogg',
        './assets/audio/melted03.ogg'
    ],
    walkSounds: [
        './assets/audio/walk01.ogg',
        './assets/audio/walk02.ogg',
        './assets/audio/walk03.ogg',
        './assets/audio/walk04.ogg'
    ],
    audioGame: ['./assets/audio/game.mp3'],
    levelUpSound: ['./assets/audio/levelUp.mp3'],
    winSound: ['./assets/audio/win.mp3'],
    loseSound: ['./assets/audio/game-over.mp3']
}
audioGame = new Audio(sounds['audioGame'][0])
audioGame.loop = true

// Coordenates
const ECoor = { // Element coordenates
    x: undefined,
    y: undefined,
    defineCoor(x, y){
        this.x = elementsSize * (0.3 + x)
        this.y = elementsSize * (-1.3 + y)
    }
}
const playerLocation = {
    x: undefined,
    y: undefined
}
const prizeLocation = {
    x: undefined,
    y: undefined
}
let dangerLocation = {} // Need of cleaning


// Listeners
window.addEventListener('resize', resizeCanvas)
canvas.addEventListener('click', () => {

    if (gameStarted === false) {
        startGameListeners()
        setContext()
        startLevel()
        
        if (audioGame.paused) audioGame.play()
    }
})

// Start Page
loadSounds()
resizeCanvas()
const drawStart = () => {
    clearCanvas()
    game.font = canvasSize*0.1 + "px Comfortaa"
    game.textAlign = ""
    game.fillStyle = '#072b47'
    game.textAlign = "center"
    game.textBaseline = "middle"
    game.fillText('Click to Start', (canvas.width/2), canvas.height/2)
}
drawStart()

// Time tracking
const timer = document.querySelector('.time')
let startTime
let timerInterval


// Functions
function loadSounds() {
    const audioElements = []

    const soundCategories = Object.keys(sounds)
    soundCategories.forEach(soundCategory => {
        sounds[soundCategory].forEach(soundPath => {
            const audio = new Audio(soundPath)
            audioElements.push(audio)
        })
    })
}
function resizeCanvas() {
    canvasSize = window.innerHeight>window.innerWidth? window.innerWidth*.6 : window.innerHeight*.6
    canvas.setAttribute('width', canvasSize)
    canvas.setAttribute('height', canvasSize)
    elementsSize = canvasSize/11
    game.font = `${elementsSize}px Comfortaa`
}
function startLevel() {
    // Draw level
    levelElements = cleanLevel()
    drawElements()
}

function cleanLevel() {
    let level = map[currentLevel]
    let cleanedLevel = level.replace(/\s/g, "")
    const mapRows = new RegExp('.{1,10}', 'g')
    cleanedLevel = cleanedLevel.match(mapRows)
    cleanedLevel = cleanedLevel.map((row => [...row]))
    return cleanedLevel
}

function drawElements() {
    clearCanvas()
    levelElements.forEach((row, rowI) => {
        row.forEach((col, colI) => {
            let emoji = emojis[col]

            // Positioning elements in the center of the canvas
            ECoor.defineCoor(colI, -rowI)
            game.fillText(emoji, ECoor.x, -ECoor.y)

            if (col === 'O' && gameStarted === false) {
                playerLocation.x = colI
                playerLocation.y = yCoordinate(-rowI)
                locatePlayer(playerLocation.x, playerLocation.y)
            }
            if (col === 'I') {
                prizeLocation.x = colI
                prizeLocation.y = yCoordinate(-rowI)
            }
            if (col === 'X') {
                dangerLocation[`bomb${colI}_${rowI}`] = dangerLocation[`bomb${colI}_${rowI}`] || [colI, yCoordinate(-rowI)]
            }
        })
    })
}

function clearCanvas() {
    game.clearRect(0, 0, canvas.width, canvas.height)
}

// To avoid a -0 value
function yCoordinate(y) {
    if (y > -1) return 0
    return y
}

function locatePlayer(x, y) {
    playerLocation.x = x
    playerLocation.y = y
    ECoor.defineCoor(x, y)
    game.fillText(emojis['PLAYER'], ECoor.x, -ECoor.y)
}

function defineMovement(event) {
    let eventDef

    if (event.type === 'click') {
        eventDef = event.target.id
    } else if (event.type === 'keydown') {
        eventDef = event.key
    }
    
    switch (eventDef) {
        case 'ArrowUp':
        case 'up':
        case 'w':
        case 'W':
            walk(0, 1)
            break
        case 'ArrowLeft':
        case 'left':
        case 'a':
        case 'A':
            walk(-1, 0)
            break
        case 'ArrowRight':
        case 'right':
        case 'd':
        case 'D':
            walk(1, 0)
            break
        case 'ArrowDown':
        case 'down':
        case 's':
        case 'S':
            walk(0, -1)
            break
        default:
            break
    }
}

function walk(a, b) {
    const newLocX = playerLocation.x + a
    const newLocY = playerLocation.y + b
    
    if (newLocX >= 0 && newLocX <= 9 && newLocY >= -9 && newLocY <= 0) {
        if (currentLevel === 0 && !gameStarted) startTimer()

        gameStarted = true
        drawElements()
        locatePlayer(newLocX, newLocY)
        playRandomSound('walkSounds')

        // Evaluar colisión
        function findPrize() {
            const isPlayerOnPrize = playerLocation.x === prizeLocation.x && playerLocation.y === prizeLocation.y
        
            if (isPlayerOnPrize) {
                if (currentLevel !== maxLevel -1) {
                    currentLevel++
                    gameStarted = false
                    dangerLocation = {}
                    playAudio(sounds['levelUpSound'][0])
                    startLevel()
                } else {
                    endGame()
                    localStorage.setItem('player', JSON.stringify(player))
                }
            }
        }        
        findPrize()

        function meltedHeart() {
            for (const fire of Object.values(dangerLocation)) {
                const [fireX, fireY] = fire
        
                if (playerLocation.x === fireX && playerLocation.y === fireY) {
                    gameStarted = false
                    playRandomSound('meltedSounds')
                    startLevel()
                    break
                }
            }
        }        
        meltedHeart()
    }
}

function endGame() {
    endGameListeners()
    gameStarted = false
    audioGame.pause()
    currentLevel = 0
    dangerLocation = {}
    stopTimer()

    let size = 10
    const targetSize = canvas.width / 1.618 // Golden number
    const growthRate = (targetSize - size) / (4 * 40) // 90 fps - 5s 4 30

    const draw = () => {
        game.clearRect(0, 0, canvas.width, canvas.height)
    
        game.font = size + "px Comfortaa"
        game.textAlign = ""
        game.textAlign = "center"
        game.textBaseline = "middle"
        game.fillText(emojis['PLAYER'], (canvas.width/2), canvas.height/2)
    
        if (size < targetSize) {
            size += growthRate
            requestAnimationFrame(draw)
        }
    }
    draw()
    restartXY(playerLocation)
    restartXY(ECoor)
}

function playRandomSound(soundCategory) {
    const soundList = sounds[soundCategory]
    let randomNumber = Math.floor(Math.random() * soundList.length)
    playAudio(soundList[randomNumber])
}

function playAudio(url) {
    const audio = new Audio(url)
    audio.play()
}

function startTimer() {
    startTime = new Date().getTime()
    timerInterval = setInterval(updateTimer, 100)
}

function stopTimer() {
    clearInterval(timerInterval)
    compareScore()
}

function updateTimer() {
    const currentTime = new Date().getTime()
    const elapsedTime = currentTime - startTime

    // Calcula los segundos y milisegundos
    const seconds = Math.floor(elapsedTime / 1000)
    const milliseconds = Math.floor((elapsedTime % 1000) / 10) // Redondea los milisegundos a dos dígitos

    player.currentScore = [seconds, milliseconds]

    timer.innerText = `${seconds}:${milliseconds} s`
}

function compareScore() {
    let currentScore = player.currentScore
    let recordScore = player.recordScore

    if (
        recordScore.length === 0 ||
        (recordScore[0] > currentScore[0] ||
        (recordScore[0] === currentScore[0] && recordScore[1] > currentScore[1]))
    ) {
        playAudio(sounds['winSound'][0])
        player.recordScore = [...player.currentScore]
        player.printRecord()
    } else {
        playAudio(sounds['loseSound'][0])
    }
}

function setContext() {
    game.font = `${elementsSize}px Comfortaa`
    game.textAlign = "start"
    game.textBaseline = "alphabetic"
}

function restartXY(object) {
    object.x = undefined
    object.y = undefined
}

function startGameListeners() {
    const buttons = document.getElementsByTagName('button');
    for (const button of buttons) {
        addListener(button, 'click', defineMovement);
    }
    addListener(window, 'keydown', defineMovement);
}

function endGameListeners() {
    const buttons = document.getElementsByTagName('button')
    for (const button of buttons) {
        removeListener(button, 'click', defineMovement)
    }
    removeListener(window, 'keydown', defineMovement)
}

function addListener(element, event, listener) {
    element.addEventListener(event, listener)
}

function removeListener(element, event, listener) {
    element.removeEventListener(event, listener)
}

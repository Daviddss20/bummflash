const canvas = document.querySelector('#game-canvas')
const game = canvas.getContext('2d')
let currentMap = 0
let map

// Sounds
const meltedSounds = {
    'melted01': './assets/audio/melted01.ogg',
    'melted02': './assets/audio/melted02.ogg',
    'melted03': './assets/audio/melted03.ogg'
}
const walkSounds = {
    'walk01': './assets/audio/walk01.ogg',
    'walk02': './assets/audio/walk02.ogg',
    'walk03': './assets/audio/walk03.ogg',
    'walk04': './assets/audio/walk04.ogg'
}

let audioGame = new Audio('./assets/audio/game.mp3')
audioGame.loop = true
audioGame.preload = 'auto'

let winAudio = new Audio('./assets/audio/win.mp3')
winAudio.preload = 'auto'

let gameOverAudio = new Audio('./assets/audio/game-over.mp3')
audioGame.preload = 'auto'

// document.addEventListener('visibilitychange', function() {
//     if (document.visibilityState === 'hidden') {
//         audioGame.pause()
//     } else {
//         audioGame.play()
//     }
// })

// Movements
const btnUp = document.querySelector('#up')
const btnLeft = document.querySelector('#left')
const btnRight = document.querySelector('#right')
const btnDown = document.querySelector('#down')
let gameStarted = false
let canvasSize
let elementsSize

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

// Timer
const timer = document.querySelector('#timer')
let startTime
let timerInterval

// Start Game
const startButton = document.querySelector('#start-button')
startButton.addEventListener('click', activateListeners)
window.addEventListener('resize', resizeCanvas)
resizeCanvas()
if(player.recordScore.length !== 0) {
    printRecord()
}

function resizeCanvas() {
    canvasSize = window.innerHeight>window.innerWidth? window.innerWidth*.6 : window.innerHeight*.6
    canvas.setAttribute('width', canvasSize)
    canvas.setAttribute('height', canvasSize)
    elementsSize = canvasSize/11
    game.font = `${elementsSize}px Comfortaa`
}

function renderGame() {
    audioGame.play()
    map = transformMap()
    drawElements()
}

function transformMap() {
    map = maps[currentMap]
    let mapTransformed = map.replace(/\s/g, "")
    const mapRows = new RegExp('.{1,10}', 'g')
    mapTransformed = mapTransformed.match(mapRows)
    mapTransformed = mapTransformed.map((row => [...row]))
    return mapTransformed
}

function drawElements() {
    game.clearRect(0, 0, canvas.width, canvas.height)
    map.forEach((row, rowI) => {
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
            printScreen(0, 1)
            break
        case 'ArrowLeft':
        case 'left':
        case 'a':
        case 'A':
            printScreen(-1, 0)
            break
        case 'ArrowRight':
        case 'right':
        case 'd':
        case 'D':
            printScreen(1, 0)
            break
        case 'ArrowDown':
        case 'down':
        case 's':
        case 'S':
            printScreen(0, -1)
            break
        default:
            break
    }
}

function printScreen(a, b){
    const newLocX = playerLocation.x + a
    const newLocY = playerLocation.y + b
    if (newLocX >= 0 && newLocX <= 9 && newLocY >= -9 && newLocY <= 0) {
        if (currentMap == 0 && gameStarted == false) startTimer()
        gameStarted = true
        drawElements()
        locatePlayer(newLocX, newLocY)
        findPrize()
        meltedHeart()
    }
}

function locatePlayer(x, y) {
    playerLocation.x = x
    playerLocation.y = y
    ECoor.defineCoor(x, y)
    game.fillText(emojis['PLAYER'], ECoor.x, -ECoor.y)
    playRandomSound(walkSounds)
}

function findPrize() {
    if(playerLocation.x === prizeLocation.x && playerLocation.y === prizeLocation.y && currentMap != maps.length-1) {
        map = maps[currentMap + 1]
        currentMap++
        gameStarted = false
        dangerLocation = {}
        playAudio('./assets/audio/levelUp.mp3')
        renderGame()
    } else if (playerLocation.x === prizeLocation.x && playerLocation.y === prizeLocation.y) {
        endGame()
        localStorage.setItem('player', JSON.stringify(player))
    }
}

// To avoid a -0 value
function yCoordinate(y) {
    if (y > -1) {
        return 0
    }
    return y
}

function meltedHeart() {
    for (let fire in dangerLocation) {
        let fireX = dangerLocation[fire][0]
        let fireY = dangerLocation[fire][1]
        if(playerLocation.x === fireX && playerLocation.y === fireY) {
            gameStarted = false
            playRandomSound(meltedSounds)
            renderGame()
        }
    }
}

function endGame() {
    gameStarted = false
    audioGame.pause()
    audioGame.currentTime = 0
    currentMap = 0
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
    removeListeners()
    restartXY(playerLocation)
    restartXY(ECoor)
}

function playAudio(url) {
    const audio = new Audio(url)
    audio.play()
}

function playRandomSound(soundsObject) {
    const keys = Object.keys(soundsObject)
    const randomKey = keys[Math.floor(Math.random() * keys.length)]
    playAudio(soundsObject[randomKey])
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
        winAudio.play()
        player.recordScore = [...player.currentScore]
    } else {
        gameOverAudio.play()
    }
    printRecord()
}

function printRecord() {
    const recordScoreSpan = document.querySelector('#recordScore')
    recordScoreSpan.innerText = `${player.recordScore[0]}:${player.recordScore[1]} s`
}

function activateListeners() {
    game.font = `${elementsSize}px Comfortaa`
    game.textAlign = "start"
    game.textBaseline = "alphabetic"
    renderGame()
    window.addEventListener('keydown', defineMovement)
    btnUp.addEventListener('click', defineMovement)
    btnLeft.addEventListener('click', defineMovement)
    btnRight.addEventListener('click', defineMovement)
    btnDown.addEventListener('click', defineMovement)
}

function removeListeners() {
    window.removeEventListener('keydown', defineMovement)
    btnUp.removeEventListener('click', defineMovement)
    btnLeft.removeEventListener('click', defineMovement)
    btnRight.removeEventListener('click', defineMovement)
    btnDown.removeEventListener('click', defineMovement)
}

function restartXY(object) {
    object.x = undefined
    object.y = undefined
}
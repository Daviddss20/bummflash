import {maps} from './maps.mjs'

// Document elements
const mapsWrapper = document.querySelector('.maps-wrapper')

// Maps and render
const mapList = Object.keys(maps)
const renderMapList = (box, map) => {
    const mapWrapper = document.createElement('div')
    const mapName = document.createElement('span')
    const maxScore = document.createElement('span')

    mapWrapper.classList.add('map')
    mapWrapper.setAttribute('name', map)

    const playerList = maps[map].players
    // acc: accumulated - curr: current
    const shortestPlayer = playerList.reduce((acc, curr) => curr.time < acc.time ? curr : acc)

    mapName.innerText = map
    maxScore.innerText = `⭐ ${shortestPlayer.time} s`

    mapWrapper.append(mapName,maxScore)

    box.append(mapWrapper)
}
mapList.forEach(map => {
    renderMapList(mapsWrapper, map)
});

// Select map and start game
const mapBoxes = document.querySelectorAll('.map')
let selectedMap
mapBoxes.forEach(box => {
    box.addEventListener('click', () => {
        selectedMap = box.getAttribute('name')
        localStorage.setItem('selectedMap', selectedMap)
        window.location.href  = 'game.html'
    })
})

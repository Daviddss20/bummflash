export let player

try {
    player = JSON.parse(localStorage.getItem('player'))
} catch (error) {
    player = null
}

if (player === null) {
    player = {
    userName: 'Player',
    recordScore: [],
    currentScore: []
    }
    localStorage.setItem('player', JSON.stringify(player))
}

player.printRecord = function () {
    const recordScoreSpan = document.querySelector('#recordScore')
    recordScoreSpan.innerText = `${this.recordScore[0]}:${this.recordScore[1]} s`
}

if(player.recordScore.length !== 0) player.printRecord()

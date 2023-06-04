let player = localStorage.getItem('player')
if (player == null) {
    let defaultPlayer = {
        userName: 'Player',
        recordScore: [],
        currentScore: []
    }
    localStorage.setItem('player', JSON.stringify(defaultPlayer))
} else {
    player = JSON.parse(localStorage.getItem('player'))
}
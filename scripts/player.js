let player;

try {
    player = JSON.parse(localStorage.getItem('player'));
} catch (error) {
    player = null
}

if (player === null) {
    let defaultPlayer = {
    userName: 'Player',
    recordScore: [],
    currentScore: []
    };
    localStorage.setItem('player', JSON.stringify(defaultPlayer));
}
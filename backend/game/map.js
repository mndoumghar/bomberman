function isStartingPosition(x, y) {
  const startPositions = [
    [1, 1], [2, 1], [1, 2], 
    [13, 1], [12, 1], [13, 2],
    [1, 11], [2, 11], [1, 10],
    [13, 11], [12, 11], [13, 10] 
  ];
  return startPositions.some(([px, py]) => px === x && py === y);
}

function initializeMap() {
  const map = [];
  for (let y = 0; y < 13; y++) {
    const row = [];
    for (let x = 0; x < 15; x++) {
      if (x === 0 || y === 0 || x === 14 || y === 12) {
        row.push('wall'); 
      } else if (x % 2 === 0 && y % 2 === 0) {
        row.push('wall'); 
      } else if (isStartingPosition(x, y)) {
        row.push('empty'); 
      } else if (Math.random() < 0.6) {
        row.push('block');
      } else {
        row.push('empty');
      }
    }
    map.push(row);
  }
  return map;
}

function getStartingPosition(playerIndex) {
  const positions = [
    { x: 1, y: 1 },
    { x: 13, y: 1 }, 
    { x: 1, y: 11 }, 
    { x: 13, y: 11 } 
  ];
  return positions[playerIndex] || positions[0];
}

module.exports = {
    initializeMap,
    getStartingPosition
};
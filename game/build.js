import Entity from "./ENTITY.js";

export class Built {
    constructor() {
        const TILE_SIZE = 80;
        let grid = [
            [1, 1, 1, 1, 1, 1, 1,],
            [1, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 1, 0, 1,],
            [1, 0, 1, , 1, 0, 1, 1],
            [1, 0, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1],
        ]

        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[0].length; col++) {
                if (grid[row][col] === 1) {
                    const tile = new Entity({ className: 'built' });
                    tile.setX(col * TILE_SIZE + 100);
                    tile.setY(row * TILE_SIZE + 40);
                }
            }
        }
    }
}

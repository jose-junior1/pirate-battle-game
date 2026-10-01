import { ISLAND_GRID } from '../config';

const TILE_SIZE = 64;
const SHIP_RADIUS = 18;

export function isPointSolid(x: number, y: number): boolean {
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);

    if (row < 0 || row >= ISLAND_GRID.length || col < 0 || col >= ISLAND_GRID[0].length) {
        return true;
    }

    return ISLAND_GRID[row][col] !== 0;
}

export function checkShipCollision(x: number, y: number): boolean {
    return (
        isPointSolid(x, y) ||
        isPointSolid(x + SHIP_RADIUS, y) ||
        isPointSolid(x - SHIP_RADIUS, y) ||
        isPointSolid(x, y + SHIP_RADIUS) ||
        isPointSolid(x, y - SHIP_RADIUS)
    );
}
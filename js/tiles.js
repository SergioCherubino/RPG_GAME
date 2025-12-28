import { tiles } from "./config.js";
import { state } from "./state.js";
import { getCell } from "./grid.js";
import { renderWalls } from "./walls.js";

export function setTile(board, x, y) {
  const cellData = state.grid[y][x];
  const cell = getCell(board, x, y);

  if (!state.selectedTile) return;

  const { type, color } = state.selectedTile;

  // 🔁 toggle (remove se for o mesmo)
  if (cellData.tile === type && cellData.color === color) {
    clearTile(cellData, cell, x, y);
    return;
  }

  const colorSet =
    tiles[type]?.[color] ||
    tiles[type]?.normal;

  if (!colorSet) {
    console.warn("Tile não encontrado:", type, color);
    return;
  }

  const img = randomFrom(colorSet);

  cellData.tile = type;
  cellData.color = color;
  cellData.img = img;

  cell.style.backgroundImage = `url("${img}")`;
  cell.className = "cell";

  renderWalls(board, x, y);
}

function clearTile(cellData, cell) {
  cellData.tile = null;
  cellData.color = null;
  cellData.img = null;

  cell.style.backgroundImage = "";
  cell.className = "cell";
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

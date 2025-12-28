import { state } from "./state.js";
import { tiles } from "./config.js";

export function exportMap() {
  return {
    boardSize: state.grid.length,
    grid: state.grid
  };
}

function getRandomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function loadMap(data) {
  state.grid = JSON.parse(JSON.stringify(data.grid));

  for (let y = 0; y < state.grid.length; y++) {
    for (let x = 0; x < state.grid[y].length; x++) {
      const cell = state.grid[y][x];

      // 🔒 garante cor válida
      if (!cell.color || !tiles.floor[cell.color]) {
        cell.color = "normal";
      }

      // 🎨 aplica tile correto
      const variants = tiles.floor[cell.color];
      cell.tile = getRandomFromArray(variants);
    }
  }
}


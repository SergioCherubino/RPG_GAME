import { BOARD_SIZE } from "./config.js";
import { state } from "./state.js";



export function initGrid(board, onCellAction) {
  state.grid = [];

  board.innerHTML = "";

  for (let y = 0; y < BOARD_SIZE; y++) {
    state.grid[y] = [];

    for (let x = 0; x < BOARD_SIZE; x++) {
      state.grid[y][x] = createEmptyCellData();

      const cell = createCell(x, y, onCellAction);
      board.appendChild(cell);
    }
  }
}
console.log("Grid inicializado:", BOARD_SIZE, "x", BOARD_SIZE);

function createEmptyCellData() {
  return {
    tile: null,
    color: null,
    img: null,
    object: null,
    objectRoot: null,
    monster: null,
    walls: { top: "none", right: "none", bottom: "none", left: "none" },
    visible: false,
    explored: false
  };
}

function createCell(x, y, onCellAction) {
  const cell = document.createElement("div");
  cell.className = "cell";
  cell.dataset.x = x;
  cell.dataset.y = y;

  cell.addEventListener("dragover", e => e.preventDefault());

  cell.addEventListener("drop", e => {
    if (onCellAction) onCellAction(x, y, e);
  });

  cell.addEventListener("click", e => {
    if (onCellAction) onCellAction(x, y, e);
  });

  return cell;
}


export function getCell(board, x, y) {
  return board.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
}

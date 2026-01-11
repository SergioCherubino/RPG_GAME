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
    walls: {
      top:    { type: "none" },
      right:  { type: "none" },
      bottom: { type: "none" },
      left:   { type: "none" }
    },
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

export function hasWallBetween(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;

  if (Math.abs(dx) + Math.abs(dy) !== 1) return true;

  const from = state.grid[y1][x1];
  const to   = state.grid[y2][x2];

  if (dx === 1) {
    return blocks(from.walls.right) || blocks(to.walls.left);
  }
  if (dx === -1) {
    return blocks(from.walls.left) || blocks(to.walls.right);
  }
  if (dy === 1) {
    return blocks(from.walls.bottom) || blocks(to.walls.top);
  }
  if (dy === -1) {
    return blocks(from.walls.top) || blocks(to.walls.bottom);
  }

  return true;
}

function blocks(wall) {
  if (!wall) return false;
  if (wall.type === "wall") return true;
  if (wall.type === "door" && !wall.open) return true;
  return false;
}

export function openDoorBothSides(x, y, side) {
  const cell = state.grid[y][x];
  const wall = cell.walls[side];

  if (!wall || wall.type !== "door") return;

  // abre deste lado
  wall.open = true;
  wall.openTurnsLeft = 10;

  // calcula célula vizinha
  const opposite = getOppositeSide(side);

  let nx = x;
  let ny = y;

  if (side === "right") nx++;
  if (side === "left") nx--;
  if (side === "bottom") ny++;
  if (side === "top") ny--;

  const otherCell = state.grid[ny]?.[nx];
  if (!otherCell) return;

  const otherWall = otherCell.walls[opposite];
  if (otherWall?.type === "door") {
    otherWall.open = true;
    otherWall.openTurnsLeft = 10;
  }
}

function getOppositeSide(side) {
  return {
    top: "bottom",
    bottom: "top",
    left: "right",
    right: "left"
  }[side];
}

export function closeDoor(x, y, side) {
  const wall = state.grid[y][x].walls[side];
  if (!wall || wall.type !== "door") return;

  wall.open = false;
  wall.openTurnsLeft = 0;
}

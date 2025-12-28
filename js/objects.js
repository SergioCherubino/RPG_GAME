import { objects, TILE_SIZE, BOARD_SIZE } from "./config.js";
import { state } from "./state.js";
import { getCell } from "./grid.js";

export function setObject(board, x, y) {
  const cellData = state.grid[y][x];
  const type = state.selectedObject;

  if (cellData.monster) return;

  if (cellData.object) {
    const root = cellData.objectRoot;
    if (cellData.object === type && root) {
      removeObject(board, root.x, root.y);
    }
    return;
  }

  const def = objects[type];
  if (!def) return;

  if (!canPlaceObject(x, y, def)) return;

  placeObject(board, x, y, type, def);
}

function canPlaceObject(x, y, def) {
  if (x + def.w > BOARD_SIZE || y + def.h > BOARD_SIZE) return false;

  for (let yy = y; yy < y + def.h; yy++) {
    for (let xx = x; xx < x + def.w; xx++) {
      if (state.grid[yy][xx].object) return false;
    }
  }
  return true;
}

function placeObject(board, x, y, type, def) {
  for (let yy = y; yy < y + def.h; yy++) {
    for (let xx = x; xx < x + def.w; xx++) {
      state.grid[yy][xx].object = type;
      state.grid[yy][xx].objectRoot = { x, y };
    }
  }

  const cell = getCell(board, x, y);
  const img = document.createElement("img");

  img.src = def.img;
  img.className = "map-object";
  img.style.width = `${def.w * TILE_SIZE}px`;
  img.style.height = `${def.h * TILE_SIZE}px`;
  img.style.position = "absolute";
  img.style.pointerEvents = "none";

  cell.appendChild(img);
}

export function removeObject(board, x, y) {
  const root = state.grid[y][x].objectRoot;
  if (!root) return;

  const def = objects[state.grid[y][x].object];

  for (let yy = root.y; yy < root.y + def.h; yy++) {
    for (let xx = root.x; xx < root.x + def.w; xx++) {
      state.grid[yy][xx].object = null;
      state.grid[yy][xx].objectRoot = null;
    }
  }

  const cell = getCell(board, root.x, root.y);
  cell.querySelector(".map-object")?.remove();
}

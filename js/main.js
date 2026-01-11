import { initGrid, getCell } from "./grid.js";
import { setTile } from "./tiles.js";
import { setObject } from "./objects.js";
import { setMonster } from "./setMonster.js";
import { renderBoard } from "./render.js";
import { state } from "./state.js";
import { getEdgeFromMouse, toggleBarrier } from "./walls.js";
import {
  initTilePalette,
  initWallButtons,
  initObjectPalette,
  initMonsterPalette
} from "./ui.js";
import { initIO } from "./io.js";

const board = document.getElementById("board");
state.mode = "editor";
function handleCellAction(x, y, event) {

  // 🧱🚪 PRIORIDADE MÁXIMA
  if (state.wallMode || state.doorMode) {
    const cell = getCell(board, x, y);
    const edge = getEdgeFromMouse(cell, event);
    if (!edge) return;

    toggleBarrier(
      board,
      x,
      y,
      edge,
      state.wallMode ? "wall" : "door"
    );
    renderBoard(board);
    return;
  }

  // 👾 MONSTROS
  if (state.selectedMonster) {
    setMonster(board, x, y);
    renderBoard(board);
    return;
  }

  // 🪑 OBJETOS
  if (state.selectedObject) {
    setObject(board, x, y);
    return;
  }

  // 🧩 TILES
  if (state.selectedTile) {
    setTile(board, x, y);
  }
}

initGrid(board, handleCellAction);
initTilePalette();
initWallButtons();
initObjectPalette();
initMonsterPalette();
initIO(board);

// walls.js
import { state } from "./state.js";
import { getCell } from "./grid.js";

/* =========================
   EDGE DETECTION
========================= */
export function getEdgeFromMouse(cell, event) {
  const rect = cell.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const margin = 6;

  if (y < margin) return "top";
  if (y > rect.height - margin) return "bottom";
  if (x < margin) return "left";
  if (x > rect.width - margin) return "right";

  return null;
}

/* =========================
   TOGGLE WALL / DOOR
========================= */
export function toggleBarrier(board, x, y, edge, type) {
  const cellData = state.grid[y][x];

  // alterna wall / door / none
  cellData.walls[edge] =
    cellData.walls[edge] === type ? "none" : type;

  // posição vizinha
  const dx = edge === "left" ? -1 : edge === "right" ? 1 : 0;
  const dy = edge === "top" ? -1 : edge === "bottom" ? 1 : 0;

  const opposite = {
    left: "right",
    right: "left",
    top: "bottom",
    bottom: "top"
  }[edge];

  const nx = x + dx;
  const ny = y + dy;

  // espelha no tile vizinho
  if (state.grid[ny] && state.grid[ny][nx]) {
    state.grid[ny][nx].walls[opposite] = cellData.walls[edge];
    renderWalls(board, nx, ny);
  }

  renderWalls(board, x, y);
}

/* =========================
   RENDER WALLS
========================= */
export function renderWalls(board, x, y) {
  const cell = getCell(board, x, y);
  if (!cell) return;

  // remove paredes antigas
  cell.querySelectorAll(".wall, .door").forEach(el => el.remove());

  const walls = state.grid[y][x].walls;

  for (const side in walls) {
    if (walls[side] === "none") continue;

    const el = document.createElement("div");
    el.className = `
      ${walls[side]} 
      ${side} 
      ${side === "top" || side === "bottom" ? "horizontal" : "vertical"}
    `.trim();

    cell.appendChild(el);
  }
}

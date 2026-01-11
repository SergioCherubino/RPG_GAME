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

  const current = cellData.walls[edge]?.type ?? "none";

  // alterna
  if (current === type) {
    cellData.walls[edge] = { type: "none" };
  } else if (type === "wall") {
    cellData.walls[edge] = { type: "wall" };
  } else if (type === "door") {
    cellData.walls[edge] = {
      type: "door",
      open: false,
      openTurnsLeft: 0
    };
  }

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

  // remove paredes / portas antigas
  cell.querySelectorAll(".wall, .door").forEach(el => el.remove());

  const walls = state.grid[y][x].walls;

  for (const side in walls) {
    const wall = walls[side];

    if (!wall || wall.type === "none") continue;

    const el = document.createElement("div");

    // wall ou door
    el.classList.add(wall.type);

    // lado
    el.classList.add(side);

    // orientação
    el.classList.add(
      side === "top" || side === "bottom"
        ? "horizontal"
        : "vertical"
    );

    // estado da porta
    if (wall.type === "door") {
      el.classList.add(wall.open ? "open" : "closed");
    }

    cell.appendChild(el);
  }
}

export function normalizeWalls() {
  for (let y = 0; y < state.grid.length; y++) {
    for (let x = 0; x < state.grid[y].length; x++) {
      const walls = state.grid[y][x].walls;

      for (const side in walls) {
        const w = walls[side];

        // já normalizado
        if (typeof w === "object") continue;

        if (w === "wall") {
          walls[side] = { type: "wall" };
        } else if (w === "door") {
          walls[side] = {
            type: "door",
            open: false,
            openTurnsLeft: 0
          };
        } else {
          walls[side] = { type: "none" };
        }
      }
    }
  }
}


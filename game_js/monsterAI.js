// monsterAI.js
import { state } from "../js/state.js";
import { getCell } from "../js/grid.js";

// percorre o grid e faz a IA de cada monstro
export async function runMonsterAI(board) {
  for (let y = 0; y < state.grid.length; y++) {
    for (let x = 0; x < state.grid[y].length; x++) {
      const cell = state.grid[y][x];
      if (cell.monster) {
        const monster = cell.monster;
        console.log("Monstro ativo:", monster.id, "em", x, y);

        // tenta mover para uma célula adjacente vazia
        const target = getAdjacentEmptyTile(x, y);
        if (target) {
          moveMonster(monster, x, y, target.x, target.y, board);
          console.log(`Monstro ${monster.id} moveu para`, target.x, target.y);
        }
      }
    }
  }
}

// procura uma célula adjacente válida para mover
function getAdjacentEmptyTile(x, y) {
  const dirs = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
  ];

  for (const d of dirs) {
    const nx = x + d.dx;
    const ny = y + d.dy;
    if (!state.grid[ny] || !state.grid[ny][nx]) continue;
    const c = state.grid[ny][nx];

    // só move em tiles com cor (floor válido) e sem monstros/objetos
    if (c.color && c.color !== "normal" && !c.monster && !c.object) {
      return { x: nx, y: ny };
    }
  }

  return null;
}

// move o monstro no grid lógico e na tela
function moveMonster(monster, oldX, oldY, newX, newY, board) {
  // remove do grid antigo
  state.grid[oldY][oldX].monster = null;

  // adiciona no novo
  state.grid[newY][newX].monster = monster;

  // atualiza visual
  const monsterEl = document.querySelector(`.monster-${monster.id}`);
  if (!monsterEl) return;

  if (monsterEl.parentElement) monsterEl.parentElement.removeChild(monsterEl);

  const cell = getCell(board, newX, newY);
  cell.appendChild(monsterEl);

  // mantém proporção da imagem
  monsterEl.style.width = `${48}px`;
  monsterEl.style.height = `${48 * 1.5}px`;
  monsterEl.style.position = "absolute";
  monsterEl.style.bottom = "0";
}

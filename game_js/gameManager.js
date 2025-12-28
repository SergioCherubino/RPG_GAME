// gameManager.js
import { state } from "../js/state.js";
import { getCell } from "../js/grid.js";
import { TILE_SIZE } from "../js/config.js";
import { runMonsterAI } from "./monsterAI.js";

let boardRef = null;

export function startGame(board) {
  boardRef = board;
  console.log("🎮 Jogo iniciado");

  startHeroTurn();
  const testCell = getCell(boardRef, state.hero.x, state.hero.y);
  console.log(testCell); // deve ser a célula onde o herói está

}

//// Hero Turn Management ////
export function startHeroTurn() {
  state.turn = "hero";
  state.hero.movePoints = state.hero.base.movementRange;
  state.phase = "idle";

  console.log("🟢 Turno do herói! Movimentos disponíveis:", state.hero.movePoints);

  // cria visual do herói caso ainda não exista
  let heroEl = document.querySelector(".map-hero");
  if (!heroEl) {
    const cell = getCell(boardRef, state.hero.x, state.hero.y);
    heroEl = document.createElement("img");
    heroEl.src = `Assets/Sprites/${state.hero.base.sprite}`;
    heroEl.className = "map-hero";
    heroEl.style.position = "absolute";
    heroEl.style.zIndex = 30;
    heroEl.style.pointerEvents = "none";
    heroEl.style.width = `${TILE_SIZE}px`;
    heroEl.style.height = `${TILE_SIZE}px`;
    cell.appendChild(heroEl);
  }

  highlightMovableTiles();
}

function highlightMovableTiles() {
  // limpa destaques antigos
  document.querySelectorAll(".movable-tile").forEach(t => {
    t.classList.remove("movable-tile");
    t.onclick = null;
  });

  if (state.hero.movePoints <= 0) {
    state.phase = "acted";
    console.log("Fim do turno do herói");
    return;
  }

  const tiles = getAdjacentMovableTiles(state.hero.x, state.hero.y);

  for (const t of tiles) {
    const cell = getCell(boardRef, t.x, t.y);
    if (!cell) continue;

    cell.classList.add("movable-tile");
    cell.onclick = () => moveHeroStep(t.x, t.y);
  }
}

function getAdjacentMovableTiles(x, y) {
  const reachable = [];
  const directions = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 }
  ];

  for (const dir of directions) {
    const nx = x + dir.dx;
    const ny = y + dir.dy;

    if (!state.grid[ny] || !state.grid[ny][nx]) continue;
    const cell = state.grid[ny][nx];

    console.log("Checking tile:", nx, ny, cell.tile, cell.monster, cell.object);
    console.log(cell);

    if (cell.color = "normal" && !cell.monster && !cell.object) {
      console.log("✅ Movable tile:", nx, ny);
      reachable.push({ x: nx, y: ny });
    }
  }

  return reachable;
}

function moveHeroStep(x, y) {
  state.hero.x = x;
  state.hero.y = y;
  state.hero.movePoints--;
  console.log("Herói moveu para:", x, y, "Movimentos restantes:", state.hero.movePoints);

  updateHeroVisual();
  highlightMovableTiles();
  setupMonsterSelection();
}

function updateHeroVisual() {
  const heroEl = document.querySelector(".map-hero");
  if (!heroEl) return;

  // remove a imagem da célula antiga
  if (heroEl.parentElement) heroEl.parentElement.removeChild(heroEl);

  const cell = getCell(boardRef, state.hero.x, state.hero.y);
  if (!cell) return;

  cell.appendChild(heroEl);

  // opcional: ajustar tamanho da imagem dentro da célula
  heroEl.style.width = `${TILE_SIZE}px`;
  heroEl.style.height = `${TILE_SIZE * 1.5}px`; // mantém proporção desejada
  heroEl.style.position = "absolute";
  heroEl.style.bottom = "0"; // fixa a base do herói na célula
}

//// Monster Turn Management ////
export async function endHeroTurn() {
  console.log("🔴 Turno dos monstros");

  state.turn = "monsters";
  state.phase = "acting";

  // Aqui você pode chamar a IA dos monstros ou fazer a lógica de movimento/ataque
  await runMonsterAI(boardRef);
  // Por enquanto só vamos simular com um timeout
  setTimeout(() => {
    console.log("🟢 Turno do herói!");
    startHeroTurn();
  }, 1000); // 1s de "turno dos monstros" simulado
}

const endTurnBtn = document.getElementById("endTurnBtn");
endTurnBtn.addEventListener("click", () => {
  if (state.turn === "hero") {
    state.hero.movePoints = 0; // garante que não sobra movimento
    endHeroTurn();
  }
});

export function setupMonsterSelection() {
  clearMonsterSelection();

  for (let y = 0; y < state.grid.length; y++) {
    for (let x = 0; x < state.grid[y].length; x++) {
      const cellData = state.grid[y][x];
      if (!cellData.monster) continue;

      // 🚫 não é adjacente → ignora
      if (!isAdjacentToHero(x, y)) continue;

      const cellEl = getCell(boardRef, x, y);
      if (!cellEl) continue;

      cellEl.onclick = () => selectMonster(x, y);
      cellEl.classList.add("attackable-monster"); // opcional (visual)
    }
  }
}

function selectMonster(x, y) {
  clearMonsterSelection();

  const cellData = state.grid[y][x];
  if (!cellData.monster) return;

  state.selectedMonster = cellData.monster;

  const cellEl = getCell(boardRef, x, y);
  cellEl.classList.add("selected-monster");

  document.getElementById("attackBtn").style.display = "inline-block";

  console.log("👹 Monstro selecionado:", cellData.monster);

}

function clearMonsterSelection() {
  document.querySelectorAll(".selected-monster").forEach(el => {
    el.classList.remove("selected-monster");
  });

  document.querySelectorAll(".attackable-monster").forEach(el => {
    el.classList.remove("attackable-monster");
    el.onclick = null;
  });

  state.selectedMonster = null;
  document.getElementById("attackBtn").style.display = "none";
}

function isAdjacentToHero(x, y) {
  const hx = state.hero.x;
  const hy = state.hero.y;

  const dx = Math.abs(hx - x);
  const dy = Math.abs(hy - y);

  // adjacente em cruz (não diagonal)
  return (dx + dy) === 1;
}

function rollD20() {
  return Math.floor(Math.random() * 20) + 1;
}

import { Monsters } from "./monster.js";

function attackSelectedMonster() {
  const monster = state.selectedMonster;
  if (!monster) return;

  const def = Monsters[monster.id];
  if (!def) {
    console.error("Definição de monstro não encontrada:", monster.id);
    return;
  }

  const armor = def.attributes.armor;
  const roll = rollD20();

  console.log(`🎲 Rolagem: ${roll} vs Armor: ${armor}`);

  if (roll > armor) {
    const damage =
      Math.floor(
        Math.random() *
          (def.attributes.damageMax - def.attributes.damageMin + 1)
      ) + def.attributes.damageMin;

    monster.currentHp -= damage;

    console.log(`💥 Acertou! Dano: ${damage} | HP restante: ${monster.currentHp}`);

    if (monster.currentHp <= 0) {
      killMonster(monster);
    }
  } else {
    console.log("❌ Errou o ataque");
  }

  clearMonsterSelection();
}


function rollDamage() {
  return Math.floor(Math.random() * 4) + 1; // 1d4 por enquanto
}

function killMonster(monster) {
  console.log("☠️ Monstro morto");

  const { x, y } = monster;

  // Remove do estado
  state.grid[y][x].monster = null;

  // Remove do DOM
  const cellEl = getCell(boardRef, x, y);
  if (cellEl) {
    const entity = cellEl.querySelector(".entity.monster");
    if (entity) entity.remove();
  }
}


const attackBtn = document.getElementById("attackBtn");
attackBtn.addEventListener("click", attackSelectedMonster);

import { state } from "../js/state.js";
import { renderBoard } from "../js/render.js";
import { initGrid, getCell } from "../js/grid.js";
import { spawnPlayer } from "../game_js/heroSpawn.js";
import { Monsters } from "../game_js/monster.js";
import { items } from "./items.js";

const board = document.getElementById("board");
const openMapBtn = document.getElementById("openMapBtn");
const openMapInput = document.getElementById("openMapInput");
const endTurnBtn = document.getElementById("endTurnBtn");

/* =========================
   UI
========================= */
openMapBtn.addEventListener("click", () => openMapInput.click());
openMapInput.addEventListener("change", handleOpenMap);

board.addEventListener("click", e => {
  const cellEl = e.target.closest(".cell");
  if (!cellEl) return;

  const x = Number(cellEl.dataset.x);
  const y = Number(cellEl.dataset.y);
  const cell = state.grid[y][x];

  // Prioridade: atacar monstro adjacente
  if (cell.monster && isAdjacent(state.hero, cell.monster)) {
    selectedTarget = cell.monster;
    const cellDiv = getCell(board, x, y);
    cellDiv?.querySelector(".entity")?.classList.add("selected");
    document.getElementById("attackBtn").style.display = "inline-block";
    return; // NÃO tenta mover herói
  }

  // Caso contrário, tenta mover herói
  tryMoveHero(x, y);
});

endTurnBtn.addEventListener("click", () => {
  if (state.turn === "hero") {
    state.hero.movementLeft = 0; // reseta movimento para o próximo turno
    endHeroTurn();
  }
});

/* =========================
   LOAD MAP
========================= */
function handleOpenMap(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);

      // 1️⃣ cria grid vazio
      initGrid(board);

      // 2️⃣ sobrescreve grid
      state.grid = data.grid;

      state.monsters = [];

      // percorre a grid e adiciona todos os monstros no state.monsters
      for (let y = 0; y < state.grid.length; y++) {
        for (let x = 0; x < state.grid[y].length; x++) {
          const cell = state.grid[y][x];
          if (cell.monster) {
            // garante que a propriedade monster seja um objeto válido
            const monsterTemplate = Monsters[cell.monster.id];
            const monster = {
              id: cell.monster.id,
              x,
              y,
              movementRange: monsterTemplate.movementRange || 3,
              movementLeft: monsterTemplate.movementRange || 3,
              attributes: { ...monsterTemplate.attributes },
              currentHp: monsterTemplate.attributes.hp,
              damageMin: monsterTemplate.attributes.damageMin,
              damageMax: monsterTemplate.attributes.damageMax,
              armor: monsterTemplate.attributes.armor,
              gold: monsterTemplate.gold || 0,
              attackBonus: monsterTemplate.attributes.attackBonus || 0
            };
            state.monsters.push(monster);
            state.grid[y][x].monster = monster;
          }
        }
      }
      console.log("🧟 Monstros inicializados:", state.monsters);


      // 3️⃣ render oficial
      renderBoard(board);

      // 4️⃣ spawn do herói
      spawnPlayer(1, 1);
      updateHeroHUD();

      // 5️⃣ inicia sistema de turnos
      startTurnSystem();

      initInventory();

      addItemToInventory(items.sword);
      addItemToInventory(items.plateArmor);
      addItemToInventory(items.shield);

      updatePotionUI();
      updateGoldUI();

      console.log("Mapa carregado com sucesso");
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar mapa");
    }
  };

  reader.readAsText(file);
  openMapInput.value = "";
}

/* =========================
   Sistema de turnos
========================= */
let monsterIndex = 0;

export function startTurnSystem() {
  monsterIndex = 0;
  startHeroTurn();
}

export function endHeroTurn() {
  if (state.turn !== "hero") return;

  state.turn = "monsters";
  state.phase = "acting";
  monsterIndex = 0;

  console.log("👹 Turno dos MONSTROS");
  console.log("🧟 Monstros:", state.monsters);

  nextMonster();
}

function nextMonster() {
  if (monsterIndex >= state.monsters.length) {
    startHeroTurn();
    return;
  }

  const monster = state.monsters[monsterIndex];

  if (!monster || monster.hp <= 0) {
    monsterIndex++;
    nextMonster();
    return;
  }

  monsterAct(monster, () => {
    monsterIndex++;
    nextMonster();
  });
}

function startHeroTurn() {
  state.turn = "hero";
  state.phase = "idle";
  state.hero.movementLeft = state.hero.movementRange;

  highlightHeroMoves();
  console.log("🎮 Turno do HERÓI");
}

/* =========================
   Movimento do herói
========================= */
const directions = [
  { x: 0, y: -1 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
];

function canHeroMoveTo(x, y) {
  if (y < 0 || y >= state.grid.length) return false;
  if (x < 0 || x >= state.grid[0].length) return false;

  const cell = state.grid[y][x];
  if (cell.color === "normal") return false;
  if (cell.object) return false;
  if (cell.monster) return false;
  if (cell.hero) return false;

  return true;
}

function getHeroAdjacentMoves() {
  if (state.hero.movementLeft <= 0) return [];

  const { x, y } = state.hero;
  const moves = [];

  for (const d of directions) {
    const nx = x + d.x;
    const ny = y + d.y;

    if (canHeroMoveTo(nx, ny)) moves.push({ x: nx, y: ny });
  }

  return moves;
}

function highlightHeroMoves() {
  clearHeroHighlights();

  const moves = getHeroAdjacentMoves();

  for (const m of moves) {
    const cell = getCell(board, m.x, m.y);
    if (cell) cell.classList.add("movable-tile");
  }
}

function clearHeroHighlights() {
  document.querySelectorAll(".cell.movable-tile")
    .forEach(c => c.classList.remove("movable-tile"));
}

export function tryMoveHero(x, y) {
  if (state.turn !== "hero") return;
  if (state.phase !== "idle") return;
  if (state.hero.movementLeft <= 0) return;

  const valid = getHeroAdjacentMoves().some(m => m.x === x && m.y === y);
  if (!valid) return;

  moveHeroTo(x, y);
  updateHeroHUD();
  console.log(`🚶 Herói moveu para (${x}, ${y})`);
}

function moveHeroTo(x, y) {
  state.grid[state.hero.y][state.hero.x].hero = false;
  state.hero.x = x;
  state.hero.y = y;
  state.hero.movementLeft--;
  state.grid[y][x].hero = true;

  renderBoard(board);
  highlightHeroMoves();

  if (state.hero.movementLeft === 0) {
    clearHeroHighlights();
    console.log("🚫 Sem movimento restante");
  }
}
let selectedTarget = null;

export function setupMonsterSelection(board) {
  board.addEventListener("click", e => {
    const cellEl = e.target.closest(".cell");
    if (!cellEl) return;

    const x = Number(cellEl.dataset.x);
    const y = Number(cellEl.dataset.y);

    const monster = state.grid[y][x]?.monster;
    if (!monster) return;
    if (!isAdjacent(state.hero, monster)) return; // só pode atacar se adjacente

    selectTarget(monster);
  });
}

function selectTarget(monster) {
  clearSelection();

  selectedTarget = monster;

  const cell = getCell(board, monster.x, monster.y);
  const img = cell?.querySelector(".entity");
  if (img) img.classList.add("selected");

  // Só mostra botão se herói ainda não atacou
  if (state.phase === "idle") {
    document.getElementById("attackBtn").style.display = "inline-block";
  }
}

export function clearSelection() {
  selectedTarget = null;
  document.querySelectorAll(".entity.selected")
    .forEach(el => el.classList.remove("selected"));

  document.getElementById("attackBtn").style.display = "none";
}

const attackBtn = document.getElementById("attackBtn");

attackBtn.addEventListener("click", () => {
  if (!selectedTarget) return;

  if (state.phase === "acted") {
    console.log("❌ Herói já atacou neste turno!");
    return;
  }

  attackMonster(selectedTarget);
  updateHeroHUD()
  state.phase = "acted"; // marca que herói já atacou
  clearSelection();
  renderBoard(board); // atualiza visual
});

function attackMonster(monster) {
  const hero = state.hero;
  const monsterAC = monster.armor || 10; // Armor do monstro
  const attackBonus = hero.attackBonus || 0; // ataque do herói
  const attackRoll = Math.floor(Math.random() * 20) + 1 + attackBonus;

  logMessage(`🎲 ${hero.type} attacks ${monster.id}: ${attackRoll} vs AC ${monsterAC}`);
  if (attackRoll >= monsterAC) {
    const damage = Math.floor(Math.random() * (hero.attributes.damageMax - hero.attributes.damageMin + 1)) + hero.attributes.damageMin;
    monster.currentHp -= damage;
    logMessage(`→ <span class="log-hit">${hero.type} HIT!</span> ${damage} damage`);

    if (monster.currentHp <= 0) {
      logMessage(`☠️ ${monster.id} slain!`);
      state.grid[monster.y][monster.x].monster = false;
      state.monsters = state.monsters.filter(m => m !== monster);

      // 💰 DROP DE GOLD
      const goldDrop = Math.floor(Math.random() * monster.gold) + 1;
      heroGold += goldDrop;
      logMessage(`💰 ${goldDrop} gold collected`);
      updateGoldUI();
    }
  } else {
      logMessage(`→ <span class="log-miss">${hero.type} MISS!</span>`);
  }

  updateMonsterHpBubble(monster);
}

function updateMonsterHpBubble(monster) {
  const cell = getCell(board, monster.x, monster.y);
  if (!cell) return;

  const bubble = cell.querySelector(".hp-bubble");
  if (bubble) {
    bubble.textContent = Math.max(monster.currentHp, 0);
  }
}

/* =========================
   Movimento dos monstros
========================= */
function canMonsterMoveTo(x, y) {
  if (y < 0 || y >= state.grid.length) return false;
  if (x < 0 || x >= state.grid[0].length) return false;

  const cell = state.grid[y][x];
  if (cell.color === "normal") return false;
  if (cell.object) return false;
  if (cell.monster) return false;
  if (cell.hero) return false;

  return true;
}

function getNextMonsterMove(monster) {
  const dx = state.hero.x - monster.x;
  const dy = state.hero.y - monster.y;

  const moves = [];

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && canMonsterMoveTo(monster.x + 1, monster.y)) moves.push({ x: monster.x + 1, y: monster.y });
    else if (dx < 0 && canMonsterMoveTo(monster.x - 1, monster.y)) moves.push({ x: monster.x - 1, y: monster.y });
    
    if (dy > 0 && canMonsterMoveTo(monster.x, monster.y + 1)) moves.push({ x: monster.x, y: monster.y + 1 });
    else if (dy < 0 && canMonsterMoveTo(monster.x, monster.y - 1)) moves.push({ x: monster.x, y: monster.y - 1 });
  } else {
    if (dy > 0 && canMonsterMoveTo(monster.x, monster.y + 1)) moves.push({ x: monster.x, y: monster.y + 1 });
    else if (dy < 0 && canMonsterMoveTo(monster.x, monster.y - 1)) moves.push({ x: monster.x, y: monster.y - 1 });

    if (dx > 0 && canMonsterMoveTo(monster.x + 1, monster.y)) moves.push({ x: monster.x + 1, y: monster.y });
    else if (dx < 0 && canMonsterMoveTo(monster.x - 1, monster.y)) moves.push({ x: monster.x - 1, y: monster.y });
  }

  return moves[0] || null;
}
export function monsterAct(monster, done) {
  console.log(`👹 Monstro ${monster.id || ""} começa o turno`);
  monster.movementLeft = monster.movementRange;

  function step() {
    // Se está adjacente ao herói → ataque
    if (isAdjacent(monster, state.hero)) {
      attackHero(monster); // use a versão D&D que calcula acerto/dano
      console.log(`👹 Monstro ${monster.id || ""} atacou o herói!`);
      done();
      return;
    }

    // Se ainda pode se mover → tenta se mover
    if (monster.movementLeft > 0) {
      const nextMove = getNextMonsterMove(monster);

      if (nextMove) {
        moveMonsterTo(monster, nextMove.x, nextMove.y);
        monster.movementLeft--;
        setTimeout(step, 200);
      } else {
        // sem movimento possível → termina turno
        console.log(`⚠️ Monstro ${monster.id || ""} não pode se mover`);
        done();
      }
    } else {
      // sem movimento restante → termina turno
      done();
    }
  }

  step();
}


function isAdjacent(unitA, unitB) {
  const dx = Math.abs(unitA.x - unitB.x);
  const dy = Math.abs(unitA.y - unitB.y);
  return dx + dy === 1;
}

function moveMonsterTo(monster, x, y) {
  state.grid[monster.y][monster.x].monster = false;
  monster.x = x;
  monster.y = y;
  state.grid[y][x].monster = monster;

  renderBoard(board);
}
function attackHero(monster) {
  const heroAC = state.hero.attributes.ac || 10; // Armor Class do herói, default 10
  const attackRoll = Math.floor(Math.random() * 20) + 1 + (monster.attackBonus || 0);

  logMessage(`🎲 ${monster.id} attacks ${state.hero.type}: ${attackRoll} vs AC ${heroAC}`);

  if (attackRoll >= heroAC) {
    // ataque acerta → calcula dano
    const damage = Math.floor(Math.random() * (monster.damageMax - monster.damageMin + 1)) + monster.damageMin;
    state.hero.currentHp -= damage;
    logMessage(`→ <span class="log-hit">${monster.id} HIT!</span> ${damage} damage`);
  } else {
    logMessage(`→ <span class="log-miss">${monster.id} MISS!</span>`);
  }
  updateHeroHpBubble();
}

export function updateHeroHpBubble() {
  const board = document.getElementById("board");
  const cell = board.querySelector(`.cell[data-x="${state.hero.x}"][data-y="${state.hero.y}"]`);
  if (!cell) return;

  const bubble = cell.querySelector(".hp-bubble");
  if (bubble) {
    bubble.textContent = state.hero.currentHp;
  }
}

/* =========================
    Console de mensagens
========================= */
export function logMessage(text) {
  const box = document.getElementById("consoleBox");
  if (!box) return;

  const line = document.createElement("div");
  line.className = "console-line";
  line.innerHTML = text;

  box.appendChild(line);

  // rola automaticamente para o final
  box.scrollTop = box.scrollHeight;
}

/* =========================
    Atualiza HUD do herói   
========================= */
export function updateHeroHUD() {
    if (!state.hero) return;

    document.getElementById("hud-class").textContent = state.hero.type || "-";
    document.getElementById("hud-hp").textContent = `${state.hero.currentHp}/${state.hero.attributes.hp}`;
    document.getElementById("hud-armor").textContent = state.hero.attributes.armor;
    document.getElementById("hud-damage").textContent = `${state.hero.attributes.damageMin}-${state.hero.attributes.damageMax}`;
    document.getElementById("hud-move").textContent = state.hero.movementRange;
}

/* =========================
    Inventário do herói
========================= */
const INVENTORY_SIZE = 20;
const inventory = Array(INVENTORY_SIZE).fill(null);
let selectedInventoryIndex = null;

const equipped = {
  weapon: null,
  armor: null,
  shield: null
};

function initInventory() {
  const grid = document.getElementById("inventoryGrid");
  grid.innerHTML = "";

  for (let i = 0; i < INVENTORY_SIZE; i++) {
    const slot = document.createElement("div");
    slot.className = "inventory-slot";
    slot.dataset.index = i;

    slot.onclick = () => onInventorySlotClick(i);

    grid.appendChild(slot);
  }
}

function equipItem(slot, item) {
  if (slot === "weapon") {
    state.hero.attributes.damageMin += item.damageMin;
    state.hero.attributes.damageMax += item.damageMax;
  }

  if (slot === "armor" || slot === "shield") {
    state.hero.attributes.armor += item.armor;
  }

  const slotDiv = document.querySelector(`.slot[data-slot="${slot}"]`);
  slotDiv.innerHTML = item.icon ? `<img src="Assets/items/${item.icon}" alt="${item.name}">` : item.name;
  slotDiv.classList.add("filled");

  updateHeroHUD();
}

function addItemToInventory(item) {
  const index = inventory.findIndex(i => i === null);
  if (index === -1) {
    logMessage(`<span class="log-miss">Inventory full!</span>`);
    return;
  }

  inventory[index] = item;
  renderInventory();
}
function renderInventory() {
  document.querySelectorAll(".inventory-slot").forEach((slot, i) => {
    slot.classList.remove("selected");
    slot.innerHTML = "";

    const item = inventory[i];
    if (!item) return;

    const img = document.createElement("img");
    img.src = `Assets/items/${item.icon}`;
    slot.appendChild(img);
  });
}
function onInventorySlotClick(index) {
  const item = inventory[index];
  if (!item) return;

  clearInventorySelection();

  selectedInventoryIndex = index;
  document
    .querySelector(`.inventory-slot[data-index="${index}"]`)
    .classList.add("selected");

  if (item.slot) {
    showEquipButton(item);
  }
}

function clearInventorySelection() {
  document
    .querySelectorAll(".inventory-slot")
    .forEach(s => s.classList.remove("selected"));

  selectedInventoryIndex = null;
  hideEquipButton();
  hideUnequipButton();
  drinkBtn.style.display = "none";
}

function equipSelectedItem(item) {
  const slot = item.slot; // weapon / armor / shield
  const invIndex = selectedInventoryIndex;

  // 🔁 Se já tiver algo equipado, devolve pro inventário
  if (equipped[slot]) {
    inventory[invIndex] = equipped[slot];
    unequipItem(slot);
  } else {
    inventory[invIndex] = null;
  }

  equipped[slot] = item;
  equipItem(slot, item); // ← você já tem essa função

  renderInventory();
  clearInventorySelection();

  logMessage(`<span class="log-hit">${item.name}</span> equipped`);
  hideUnequipButton();
}

function unequipItem(slot) {
  const item = equipped[slot];
  if (!item) return;

  if (slot === "weapon") {
    state.hero.attributes.damageMin -= item.damageMin;
    state.hero.attributes.damageMax -= item.damageMax;
  }
  if (slot === "armor" || slot === "shield") {
    state.hero.attributes.armor -= item.armor;
  }

  equipped[slot] = null;
}

function showUnequipButton(slot) {
  unequipBtn.style.display = "inline-block";
  unequipBtn.onclick = () => unequipToInventory(slot);
}

document.querySelectorAll(".slot").forEach(slotDiv => {
  slotDiv.addEventListener("click", () => {
    const slot = slotDiv.dataset.slot;
    const item = equipped[slot];

    if (!item) return;

    showUnequipButton(slot);
  });
});

function hideUnequipButton() {
  unequipBtn.style.display = "none";
}

function unequipToInventory(slot) {
  const item = equipped[slot];
  if (!item) return;

  const index = inventory.findIndex(i => i === null);
  if (index === -1) {
    logMessage(`<span class="log-miss">Inventory full!</span>`);
    return;
  }

  // remove bônus
  unequipItem(slot);

  // move item para inventário
  inventory[index] = item;

  // limpa slot visual
  const slotDiv = document.querySelector(`.slot[data-slot="${slot}"]`);
  if(slot == "weapon"){
  slotDiv.textContent = "Weapon";
  slotDiv.classList.remove("filled");
  } else if(slot == "armor"){
    slotDiv.textContent = "Armor";
    slotDiv.classList.remove("filled");
  } else if(slot == "shield"){
    slotDiv.textContent = "Shield";
    slotDiv.classList.remove("filled");
  }
  renderInventory();
  updateHeroHUD();
  hideUnequipButton();

  logMessage(`<span class="log-hit">${item.name}</span> unequipped`);
}

let potionCount = 5;
const MAX_POTIONS = 10;

let heroGold = 0;

const equipBtn = document.getElementById("equipBtn");
const unequipBtn = document.getElementById("unequipBtn");
const drinkBtn = document.getElementById("drinkBtn");

function showEquipButton(item) {
  equipBtn.style.display = "inline-block";
  equipBtn.onclick = () => equipSelectedItem(item);
}

function hideEquipButton() {
  equipBtn.style.display = "none";
}

function updateGoldUI() {
  document.getElementById("goldAmount").textContent = heroGold;
}

function updatePotionUI() {
  document.getElementById("potionCount").textContent = potionCount;
}

function addPotion(amount = 1) {
  potionCount = Math.min(MAX_POTIONS, potionCount + amount);
  updatePotionUI();
  logMessage(`🧪 +${amount} potions`);
}



document.getElementById("potionSlot").addEventListener("click", () => {
  if (potionCount <= 0) return;

  hideEquipButton();
  hideUnequipButton();

  drinkBtn.style.display = "inline-block";
});

drinkBtn.addEventListener("click", () => {
  if (potionCount <= 0) return;

  hideEquipButton();
  hideUnequipButton();

  const maxHp = state.hero.attributes.hp;
  const currentHp = state.hero.currentHp;

  if (currentHp >= maxHp) {
    logMessage("🧪 HP already at maximum");
    drinkBtn.style.display = "none";
    return;
  }

  const heal = Math.floor(Math.random() * 10) + 1;
  const before = state.hero.currentHp;

  state.hero.currentHp = Math.min(before + heal, maxHp);
  const healed = state.hero.currentHp - before;

  potionCount--;
  updatePotionUI();
  updateHeroHUD();
  updateHeroHpBubble();

  logMessage(`🧪 Drank potion and healed ${healed} HP`);

  drinkBtn.style.display = "none";
});
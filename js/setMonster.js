// monsters.js
import { state } from "./state.js";
import { Monsters } from "../game_js/monster.js";

export function setMonster(board, x, y) {
  const cellData = state.grid[y][x];
  const type = state.selectedMonster;

  // nada selecionado
  if (!type) return;

  // ❌ não pode colocar monstro onde tem objeto
  if (cellData.object) return;

  // 🔁 já existe monstro
  if (cellData.monster) {

    // 👉 mesmo tipo → REMOVE
    if (cellData.monster.id === type) {
      removeMonster(x, y);
    }

    // 👉 outro tipo → não faz nada
    return;
  }

  // ✅ cria monstro
  const def = Monsters[type];
  if (!def) return;

  placeMonster(x, y, type, def);
}

/* =========================
   PLACE
========================= */
function placeMonster(x, y, type, def) {
  console.log("placing monster", type, "at", x, y);
  state.grid[y][x].monster = {
    id: type,
    currentHp: def.attributes.hp
  };
}

/* =========================
   REMOVE
========================= */
function removeMonster(x, y) {
  console.log("removing monster at", x, y); 
  state.grid[y][x].monster = null;
}

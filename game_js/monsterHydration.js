// game/monsterHydration.js
import { state } from "../js/state.js";
import { Monsters } from "./monster.js";

export function hydrateMonstersFromGrid() {
  console.log("⚠️ hydrateMonstersFromGrid chamado");

  for (let y = 0; y < state.grid.length; y++) {
    for (let x = 0; x < state.grid[y].length; x++) {
      const cell = state.grid[y][x];
      if (!cell.monster) continue;

      const def = Monsters[cell.monster.id];
      if (!def) {
        console.warn("Monstro desconhecido:", cell.monster.id);
        cell.monster = null;
        continue;
      }

      cell.monster = {
        id: cell.monster.id,
        x,
        y,
        currentHp: def.attributes.hp
      };
    }
  }
}

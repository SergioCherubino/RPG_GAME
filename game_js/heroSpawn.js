// game js/playerSpawn.js
import { renderBoard } from "../js/render.js";
import { state } from "../js/state.js";
import { PlayerClasses } from "./player.js";

export function spawnPlayer(x, y) {
  const selected = localStorage.getItem("playerCharacter");
  if (!selected) return;

  const def = PlayerClasses[selected];
  if (!def) return;

  // salva no state
  state.hero = {
    id: selected,
    type: selected,
    x,
    y,
    movementRange: def.movementRange,
    attributes: { ...def.attributes },
    currentHp: def.attributes.hp,
    damageMin: def.attributes.damageMin,
    damageMax: def.attributes.damageMax,
    armor: def.attributes.armor, // útil se quiser usar fora de attributes
    attackBonus: def.attributes.attackBonus || 0
  };


  // marca no grid
  state.grid[y][x].hero = true;
  renderBoard(document.getElementById("board"));
}

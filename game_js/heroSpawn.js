// game js/playerSpawn.js
import { renderBoard } from "../js/render.js";
import { state } from "../js/state.js";
import { PlayerClasses } from "./player.js";
import { updateHeroVision } from "./game.js";

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
    level: def.level || 1,
    currentXp: def.currentXp || 0,
    xpToNextLevel: def.xpToNextLevel || 1000 * (def.level || 1),
    attributes: { ...def.attributes },
    currentHp: def.attributes.hp,
    damageMin: def.attributes.damageMin,
    damageMax: def.attributes.damageMax,
    armor: def.attributes.armor,
    attackBonus: def.attributes.attackBonus || 0,
    visionRange: def.visionRange,
    spells: def.spells ? structuredClone(def.spells) : null,
    direction: def.direction,
    isWalking: def.isWalking
  };
  updateHeroVision();

  // marca no grid
  state.grid[y][x].hero = true;
  renderBoard(document.getElementById("board"));
}

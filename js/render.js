import { state } from "./state.js";
import { getCell } from "./grid.js";
import { renderWalls } from "./walls.js";
import { objects, TILE_SIZE } from "./config.js";
import { Monsters } from "../game_js/monster.js";
import { PlayerClasses } from "../game_js/player.js";

export function renderBoard(board) {

  for (let y = 0; y < state.grid.length; y++) {
    for (let x = 0; x < state.grid[y].length; x++) {

      const cellData = state.grid[y][x];
      const cell = getCell(board, x, y);
      if (!cell) continue;

      // 🧹 LIMPA CONTEÚDO VISUAL
      cell.innerHTML = "";

      // =========================
      // FOG OF WAR
      // =========================
      const isEditor = state.mode === "editor";

      if (!isEditor) {

        // nunca explorado → totalmente oculto
        if (!cellData.explored) {
          cell.classList.add("fog-hidden");
          cell.classList.remove("fog-dark");
          continue; // NÃO renderiza mais nada
        }

        // explorado mas fora da visão → escurecido
        if (!cellData.visible) {
          cell.classList.add("fog-dark");
        } else {
          cell.classList.remove("fog-dark");
        }

      } else {
        // editor → tudo visível
        cell.classList.remove("fog-hidden");
        cell.classList.remove("fog-dark");
      }

      // =========================
      // TILE
      // =========================
      cell.style.backgroundImage = cellData.img
        ? `url(${cellData.img})`
        : "";


      // =========================
      // WALLS / DOORS
      // =========================
      renderWalls(board, x, y);

      // =========================
      // OBJECTS (somente raiz)
      // =========================
      if (
        cellData.objectRoot &&
        cellData.objectRoot.x === x &&
        cellData.objectRoot.y === y
      ) {
        const def = objects[cellData.object];
        if (def) {
          const img = document.createElement("img");
          img.src = def.img;
          img.className = "map-object";
          img.style.width = `${def.w * TILE_SIZE}px`;
          img.style.height = `${def.h * TILE_SIZE}px`;
          img.style.position = "absolute";
          img.style.pointerEvents = "none";
          cell.appendChild(img);
        }
      }

      // =========================
      // MONSTER
      // =========================
      if (cellData.monster) {
        const def = Monsters[cellData.monster.id];
        if (def) {
          // 🔹 Wrapper que se move
          const entity = document.createElement("div");
          entity.className = `entity monster monster-${cellData.monster.id}`;
          entity.style.position = "absolute";
          entity.style.bottom = "0";
          entity.style.left = "0";
          entity.style.width = `${TILE_SIZE}px`;
          entity.style.height = `${TILE_SIZE * 1.5}px`;
          entity.style.zIndex = 20;
          entity.style.pointerEvents = "none";

          // 🧌 Sprite
          const img = document.createElement("img");
          img.src = `Assets/monsters/${def.sprite}`;
          img.style.width = "100%";
          img.style.height = "100%";
          img.style.pointerEvents = "none";

          // 🩸 HP Bubble (filha do wrapper)
          const hpBubble = document.createElement("div");
          hpBubble.className = "hp-bubble";
          hpBubble.textContent = cellData.monster.currentHp;

          // Montagem
          entity.appendChild(img);
          entity.appendChild(hpBubble);
          cell.appendChild(entity);
        }
      }



      // =========================
      // HERO
      // =========================
      if (state.hero && state.hero.x === x && state.hero.y === y) {

        const def = PlayerClasses[state.hero.id];
        if (!def) continue;

        const img = document.createElement("img");
        img.src = `Assets/Sprites/${def.sprite}`;
        img.className = "map-hero";
        img.style.zIndex = 30;
        img.style.pointerEvents = "none";
        cell.appendChild(img);

        // 🩸 HP BUBBLE
        const hpBubble = document.createElement("div");
        hpBubble.className = "hp-bubble";
        hpBubble.textContent = state.hero.currentHp;
        hpBubble.style.zIndex = 30;
        cell.appendChild(hpBubble);
      }
    }
  }
}

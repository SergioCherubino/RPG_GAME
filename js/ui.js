import { state } from "./state.js";

function clearSelections() {
  state.selectedTile = null;
  state.selectedObject = null;
  state.selectedMonster = null;
  state.wallMode = false;
  state.doorMode = false;

  // limpa UI
  document
    .querySelectorAll(".selected-palette")
    .forEach(e => e.classList.remove("selected-palette"));

  document
    .querySelectorAll(".selected-object")
    .forEach(e => e.classList.remove("selected-object"));

  document
    .querySelectorAll(".selected-monster")
    .forEach(e => e.classList.remove("selected-monster"));

  // reset botões
  const wallBtn = document.getElementById("wallBtn");
  const doorBtn = document.getElementById("doorBtn");

  if (wallBtn) wallBtn.textContent = "🧱 Modo Parede: OFF";
  if (doorBtn) doorBtn.textContent = "🚪 Modo Porta: OFF";
}

export function initTilePalette() {
  const tiles = document.querySelectorAll(".palette img");

  tiles.forEach(img => {

    // 🖱️ clique
    img.addEventListener("click", () => {
      selectTile(img);
    });

    // 🧲 drag
    img.addEventListener("dragstart", () => {
      selectTile(img);
    });
  });
}

function selectTile(img) {
  clearSelections();

  document
    .querySelectorAll(".palette img")
    .forEach(i => i.classList.remove("selected-palette"));

  img.classList.add("selected-palette");

  state.selectedTile = {
    type: img.dataset.tile,
    color: img.dataset.color
  };

  // 🔥 IMPORTANTE
  state.selectedObject = null;
  state.wallMode = false;
  state.doorMode = false;
}

export function initWallButtons() {
  const wallBtn = document.getElementById("wallBtn");
  const doorBtn = document.getElementById("doorBtn");

  wallBtn.addEventListener("click", () => {
    clearSelections();
    state.wallMode = !state.wallMode;
    state.doorMode = false;

    wallBtn.textContent = `🧱 Modo Parede: ${state.wallMode ? "ON" : "OFF"}`;
    doorBtn.textContent = "🚪 Modo Porta: OFF";
  });

  doorBtn.addEventListener("click", () => {
    clearSelections();
    state.doorMode = !state.doorMode;
    state.wallMode = false;

    doorBtn.textContent = `🚪 Modo Porta: ${state.doorMode ? "ON" : "OFF"}`;
    wallBtn.textContent = "🧱 Modo Parede: OFF";
  });
}

export function initObjectPalette() {
  const objects = document.querySelectorAll(".object-item");

  objects.forEach(img => {

    img.addEventListener("click", () => {
      selectObject(img);
    });

    img.addEventListener("dragstart", () => {
      selectObject(img);
    });

  });
}

function selectObject(img) {
  clearSelections();
  // destaque visual
  document
    .querySelectorAll(".object-item")
    .forEach(i => i.classList.remove("selected-object"));

  img.classList.add("selected-object");

  // ✅ ISSO É O QUE ESTAVA FALTANDO
  state.selectedObject = img.dataset.object;

  // desativa outros modos
  state.selectedTile = null;
  state.selectedColor = null;
  state.wallMode = false;
  state.doorMode = false;
}

export function initMonsterPalette() {
  const monsters = document.querySelectorAll(".monster-palette img");

  monsters.forEach(img => {
    img.addEventListener("click", () => {
      selectMonster(img);
    });

    img.addEventListener("dragstart", () => {
      selectMonster(img);
    });
  });
}

function selectMonster(img) {
  clearSelections();
  document
    .querySelectorAll(".monster-palette img")
    .forEach(i => i.classList.remove("selected-monster"));

  img.classList.add("selected-monster");

  state.selectedMonster = img.dataset.monster;

  // desativa outros modos
  state.selectedTile = null;
  state.selectedObject = null;
  state.wallMode = false;
  state.doorMode = false;
}

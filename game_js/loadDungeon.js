import { initGrid } from "../js/grid.js";
import { loadMap } from "../js/mapIO.js";
import { renderBoard } from "../js/render.js";
import { spawnHeroRandom } from "./heroSpawn.js";
import { startGame } from "./gameManager.js";
import { hydrateMonstersFromGrid } from "./monsterHydration.js";

const board = document.getElementById("board");
const openBtn = document.getElementById("openMapBtn");
const openInput = document.getElementById("openMapInput");
const backBtn = document.getElementById("backBtn");

// Inicializa grid vazio
initGrid(board);

// Abrir seletor de arquivo
openBtn.onclick = () => {
  openInput.value = "";
  openInput.click();
};

// Ler JSON
openInput.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    const data = JSON.parse(reader.result);

    // Carrega grid no state
    loadMap(data);
    hydrateMonstersFromGrid();
    spawnHeroRandom();
    startGame(board);

    // Renderiza visualmente
    renderBoard(board);

  };

  reader.readAsText(file);
};

// Voltar
backBtn.onclick = () => {
  window.location.href = "index.html";
};

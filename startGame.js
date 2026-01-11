// js/startGame.js

let selectedCharacter = null;

document.addEventListener("DOMContentLoaded", () => {

  // Clique nos cards de personagem
  document.querySelectorAll(".character-card").forEach(card => {
    card.addEventListener("click", () => {
      selectCharacter(card);
    });
  });

  // Botão Start
  document.getElementById("startBtn").addEventListener("click", startGame);

  // Botão Editor
  document.getElementById("editorBtn").addEventListener("click", () => {
    window.location.href = "editor.html";
  });
});

function selectCharacter(card) {
  // remove seleção anterior
  document.querySelectorAll(".character-card")
    .forEach(c => c.classList.remove("selected"));

  // marca o selecionado
  card.classList.add("selected");

  // salva escolha
  selectedCharacter = card.dataset.char;

  // habilita botão
  enableStartButton();
}

function enableStartButton() {
  const btn = document.getElementById("startBtn");
  btn.classList.add("enabled");
}

function startGame() {
  if (!selectedCharacter) return;

  // (opcional) guardar personagem
  localStorage.setItem("playerCharacter", selectedCharacter);

  window.location.href = "city.html";
}

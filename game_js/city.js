import { items } from "./items.js";

let gold = 100;
let inventory = []; // inventário simples por enquanto

const questBoard = document.getElementById("questBoard");
const blacksmithDoor = document.getElementById("blacksmithDoor");

const questWindow = document.getElementById("questWindow");
const shopWindow = document.getElementById("shopWindow");

const goldUI = document.getElementById("gold");
const shopItemsDiv = document.getElementById("shopItems");

/* =====================
   QUESTS
===================== */
questBoard.onclick = () => {
  questWindow.classList.remove("hidden");
};

document.getElementById("startQuest").onclick = () => {
  const quest = document.querySelector("input[name='quest']:checked");
  if (!quest) return;

  // Redireciona para o jogo com o mapa escolhido
  window.location.href = `game.html?map=${quest.value}`;
};

/* =====================
   SHOP
===================== */
blacksmithDoor.onclick = () => {
  shopWindow.classList.remove("hidden");
  renderShop();
};

function renderShop() {
  shopItemsDiv.innerHTML = "";

  Object.values(items).forEach(item => {
    const div = document.createElement("div");
    div.className = "shop-item";

    div.innerHTML = `
      <span>
        ${item.name}
        ${item.damageMin ? `(DMG ${item.damageMin}-${item.damageMax})` : ""}
        ${item.armor ? `(ARM ${item.armor})` : ""}
      </span>
      <button data-id="${item.id}">Comprar (${item.price}g)</button>
    `;

    div.querySelector("button").onclick = () => buyItem(item.id);

    shopItemsDiv.appendChild(div);
  });
}

function buyItem(itemId) {
  const item = items[itemId];

  if (gold < item.price) {
    alert("Gold insuficiente!");
    return;
  }

  gold -= item.price;
  goldUI.textContent = gold;

  inventory.push({ ...item }); // clone do item
  alert(`${item.name} comprado!`);

  console.log("Inventário:", inventory);
}

/* =====================
   CLOSE WINDOWS
===================== */
document.querySelectorAll(".close").forEach(btn => {
  btn.onclick = () => {
    questWindow.classList.add("hidden");
    shopWindow.classList.add("hidden");
  };
});

import { items } from "./items.js";

export function tryDropItem() {
  const DROP_CHANCE = 0.02;

  if (Math.random() > DROP_CHANCE) {
    return null; // nenhum drop
  }

  const itemList = Object.values(items);
  const randomItem =
    itemList[Math.floor(Math.random() * itemList.length)];

  // 🔒 cria cópia do item (evita bugs de referência)
  return {
    ...randomItem,
    durability: randomItem.durability
  };
}

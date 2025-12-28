export const Monsters = {
  goblin: {
    sprite: "goblin.png",
    movementRange: 2, 
    attributes: {
      hp: 6,
      armor: 8,
      damageMin: 1,
      damageMax: 3
    },
    gold: 8
  },

  goblin_archer: {
    sprite: "goblin_archer.png",
    movementRange: 3,
    attributes: {
      hp: 12,
      armor: 10,
      damageMin: 2,
      damageMax: 5
    },
    gold: 10
  },

  goblin_warrior: {
    sprite: "goblin_warrior.png",
    movementRange: 2, // lento
    attributes: {
      hp: 20,
      armor: 14,
      damageMin: 3,
      damageMax: 8
    },
    gold: 15
  }
};

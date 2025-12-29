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
    gold: 8,
    experience: 10
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
    gold: 10,
    experience: 15
  },

  goblin_warrior: {
    sprite: "goblin_warrior.png",
    movementRange: 2,
    attributes: {
      hp: 20,
      armor: 14,
      damageMin: 3,
      damageMax: 8
    },
    gold: 15,
    experience: 100
  },
  wolf: {
    sprite: "wolf.png",
    movementRange: 4,
    attributes: {
      hp: 18,
      armor: 13,
      damageMin: 3,
      damageMax: 8
    },
    gold: 12,
    experience: 25
  }
};

export const PlayerClasses = {
  warrior: {
    sprite: "warrior.png",
    movementRange: 3,
    level: 1,
    currentXp: 0,
    xpToNextLevel: 1000,
    attributes: {
      hp: 20,
      armor: 10,
      damageMin: 1,
      damageMax: 4
    },
    visionRange: 5
  },

  rogue: {
    sprite: "rogue.png",
    movementRange: 4,
    attributes: {
      hp: 14,
      armor: 10,
      damageMin: 1,
      damageMax: 4
    },
    visionRange: 5
  },

  cleric: {
    sprite: "cleric.png",
    movementRange: 3,
    attributes: {
      hp: 12,
      armor: 10,
      damageMin: 1,
      damageMax: 2
    },
    visionRange: 5,
    spells: {
      heal: {
        name: "Heal",
        amount: 10,
        range: 5,
        cooldown: 5,
        currentCooldown: 0
      }
    }
  }
};
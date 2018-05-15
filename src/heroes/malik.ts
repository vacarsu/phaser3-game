import { State } from '../state';

export const Malik = {
    name: 'Malik',
    type: 'Mage',
    spriteSheet: 'Adventurer',
    stats: {
        hp: 400,
        spellPower: 18,
        physicalPower: 0,
        spellProtection: 15,
        physicalProtection: 12,
        movementSpeed: 5,
        attackSpeed: 1.2,
        cooldownReduction: 0,
        lifeSteal: 0,
        baseAttackDamage: 82,
    },
    autoAttackSprite: 'Fireball',
    baseAnimationFrames: {
        idle: {
            key: 'Malik-idle',
            frames: { start: 0, end: 0 },
            frameRate: 10,
            repeat: -1
        },
        walk: {
            key: 'Malik-walk',
            frames: { start: 9, end: 10 },
            frameRate: 10,
            repeat: -1
        },
        jump: {
            key: 'Malik-jump',
            frames: { start: 20, end: 20 },
            frameRate: 10,
            repeat: -1
        },
        fall: {
            key: 'Malik-fall',
            frames: { start: 20, end: 20 },
            frameRate: 10,
            repeat: -1
        },
        attack: {
            key: 'Malik-attack',
            frames: { start: 15, end: 15 },
            frameRate: 10,
            repeat: -1
        },
        hurt: {
            key: 'Malik-hurt',
            frames: { start: 2, end: 2 },
            frameRate: 10,
            repeat: -1
        }
    },
    ability1: {
        name: 'Sunder',
        description: `
            Zorik rips his target apart dealing damage and slowing their movement speed.
            
            damage: 82/95/120/200/300 + %30 spell power
            Slow: %30
            Slow Duration: 3 seconds
            cooldown: 14/12/10/8/8 seconds
        `,
        type: 'target',
        points: 0,
        isCastableAtZero: false,
        powerScaling: {
            type: 'spell',
            strength: .30
        },
        damage: {
            1: 82,
            2: 95,
            3: 120,
            4: 200,
            5: 300
        },
        cooldown: {
            1: 14,
            2: 12,
            3: 10,
            4: 8,
            5: 8
        },
        effects: {
            slow: {
                strength: .30,
                duration: 3000
            }
        },
        logic: (gameState: State) => {

        }
    },
    ability2: {
        name: 'Grotesque Vomit',
        description: `
            Zorik's last meal spews forward passing through enemies and dealing damage.
            
            damage: 100/125/200/280/350 + %50 spell power
            cooldown: 10/10/10/10/10 seconds
        `,
        type: 'projectile',
        points: 0,
        isCastableAtZero: false,
        powerScaling: {
            type: 'spell',
            strength: .50
        },
        damage: {
            1: 100,
            2: 125,
            3: 200,
            4: 280,
            5: 350
        },
        cooldown: {
            1: 10,
            2: 10,
            3: 10,
            4: 10,
            5: 10
        },
        effects: {},
        logic: (gameState: State) => {

        }
    },
    ability3: {
        name: 'Noxious Gas',
        description: `
            Zorik lets out a massive fart sending him flying forward and leaving a trail of noxious gas behind him.
            The gas deals damage to enemies standing in it every second.
            
            damage/second: 8/16/32/64/128 + %25 spell power
            cooldown: 10/10/10/10/10 seconds
        `,
        type: 'AOE Dash',
        points: 0,
        isCastableAtZero: false,
        powerScaling: {
            type: 'spell',
            strength: .25
        },
        damage: {
            1: 8,
            2: 16,
            3: 32,
            4: 64,
            5: 128
        },
        cooldown: {
            1: 10,
            2: 10,
            3: 10,
            4: 10,
            5: 10
        },
        effects: {},
        logic: (gameState: State) => {

        }
    },
    ability4: {
        name: 'Spread the Virus!',
        description: `
            Zorik spreads his virus to every enemy on the map regardless of where they are located, stunning them.
            
            Stun Duration: 2
            cooldown: 75/75/68/68/65 seconds
        `,
        type: 'AOE Dash',
        points: 0,
        isCastableAtZero: false,
        powerScaling: {
            type: 'spell',
            strength: .50
        },
        damage: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
        },
        cooldown: {
            1: 75,
            2: 75,
            3: 68,
            4: 68,
            5: 65
        },
        effects: {
            stun: {
                duration: 2000
            }
        },
        logic: (gameState: State) => {

        }
    }
};
/// <reference path="types/phaser.d.ts"/>
import * as Phaser from 'phaser';

import { State } from './state';

class Game extends Phaser.Game {
    constructor() {
        const config: GameConfig =  {
            type: Phaser.WEBGL,
            parent: 'content',
            width: 640,
            height: 480,
            scene: State,
            physics: {
                default: 'matter',
                matter: {
                    gravity: { y: 1 },
                    debug: true
                }
            },
        };
        super(config);
    }
}

window.onload = () => {
    new Game();
}
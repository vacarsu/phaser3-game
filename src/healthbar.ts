import * as Phaser from 'phaser';
import { State } from './state';

export class HealthBar {
    constructor(public gameState: State, public parent: any, public spriteName: string) {
        this.parent.add(0, 0, this.gameState.physics.add.sprite(0, 0, this.spriteName));
    }
}
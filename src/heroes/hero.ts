import * as Phaser from 'phaser';
import { State } from '../state';

export class Hero extends Phaser.GameObjects.Container {
    public state: State;
    public matterBody: Phaser.GameObjects.GameObject;
    public playerConfig: any;
    public heroConfig: any;
    public blocked: any;
	public numTouching: any;
    public sensors: any;
    public lastAutoAttacked: number;
    constructor(state: State, playerConfig: any, heroConfig: any, hpBarSpriteName: string) {
        const heroSprite: Phaser.GameObjects.Sprite = state.add.sprite(0, -60, heroConfig.spriteSheet, 0);
        const hpBarSprite: Phaser.GameObjects.Image = state.add.image(0, 0, hpBarSpriteName);
        super(state, 70, 283, [heroSprite, hpBarSprite]);
        this.state = state;
        this.playerConfig = playerConfig;
        this.heroConfig = heroConfig;
        this.setSize(100, 110);
        this.matterBody = this.state.matter.add.gameObject(this, { heroConfig });
        this.matterBody
			.setExistingBody(this.createSensors(playerConfig, heroConfig))
			.thrustBack(0)
			.setFriction(1)
			.setFrictionAir(0.001)
			.setBounce(0.2)
			.setFixedRotation()
            .setPosition(70, 283);
        this.createAnimations();
    }

    public setupController(): void {
        this.state.cursors = this.state.input.keyboard.addKeys({
            'up': Phaser.Input.Keyboard.KeyCodes.W,
            'down': Phaser.Input.Keyboard.KeyCodes.S,
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'right': Phaser.Input.Keyboard.KeyCodes.D,
            'space': Phaser.Input.Keyboard.KeyCodes.SPACE,
            'shift': Phaser.Input.Keyboard.KeyCodes.SHIFT,
            'ab1': Phaser.Input.Keyboard.KeyCodes.ONE,
            'ab2': Phaser.Input.Keyboard.KeyCodes.TWO,
            'ab3': Phaser.Input.Keyboard.KeyCodes.THREE
        });
    }

    public moveControls(): void {
        if (this.state.cursors.left.isDown) {
			this.state.player1.matterBody.setVelocityX(-1 - this.heroConfig.stats.movementSpeed);
			this.state.room.send({ action: 'updateX', value: this.state.player1.matterBody.x });
			this.state.room.send({ action: 'updateY', value: this.state.player1.matterBody.y });
			this.matterBody.first.flipX = true;
			this.state.room.send({ action: 'playAnim', value: 'walk-left' });
			this.matterBody.first.anims.play(`${this.heroConfig.name}-walk`, true);
		} else if (this.state.cursors.right.isDown) {
			this.state.player1.matterBody.setVelocityX(1 + this.heroConfig.stats.movementSpeed);
			this.state.room.send({ action: 'updateX', value: this.state.player1.matterBody.x });
			this.state.room.send({ action: 'updateY', value: this.state.player1.matterBody.y });
			this.matterBody.first.flipX = false;
			this.state.room.send({ action: 'playAnim', value: 'walk-right' });
			this.matterBody.first.anims.play(`${this.heroConfig.name}-walk`, true);
		} else if (this.state.player1.matterBody && this.state.cursors.left.isUp && this.state.cursors.right.isUp) {
			this.state.player1.matterBody.setVelocityX(0);
			this.state.room.send({ action: 'playAnim', value: 'idle' });
			this.matterBody.first.anims.play(`${this.heroConfig.name}-idle`, true);
		}

		if (this.state.cursors.space.isDown && this.blocked.bottom || this.state.cursors.up.isDown && this.blocked.bottom) {
			this.state.player1.matterBody.setVelocityY(-10);
			this.state.room.send({ action: 'updateX', value: this.state.player1.matterBody.x });
			this.state.room.send({ action: 'updateY', value: this.state.player1.matterBody.y });
			this.state.room.send({ action: 'playAnim', value: 'jump' });
			this.matterBody.first.anims.play(`${this.heroConfig.name}-jump`, true);
		} else if (this.state.cursors.space.isUp && !this.blocked.bottom || this.state.cursors.up.isUp && !this.blocked.bottom) {
			this.state.room.send({ action: 'updateX', value: this.matterBody.x });
			this.state.room.send({ action: 'updateY', value: this.state.player1.matterBody.y });
			this.state.room.send({ action: 'playAnim', value: 'fall' });
			this.matterBody.first.anims.play(`${this.heroConfig.name}-fall`, true);
		}
    }

    public basicAttackControl(time: number, delta: any): void {
        if(this.state.cursors.shift.isDown && (time / 1000 - this.lastAutoAttacked / 1000) >= (1 / this.heroConfig.stats.attackSpeed)) {
			let spawnAt: number;
			let velocity: number;
			if (this.matterBody.first.flipX) {
				spawnAt = this.matterBody.x - 40;
				velocity = -6;
			} else {
				spawnAt = this.matterBody.x + 40;
				velocity = 6;
			}
			const autoAttack = this.state.matter.add.image(
				spawnAt,
				this.matterBody.y,
                this.heroConfig.autoAttackSprite,
                null,
				{
                    playerConfig: this.playerConfig,
                    heroConfig: this.heroConfig,
					shape: { type: 'polygon', radius: 18 },
					ignorePointer: true
				}
			);
			autoAttack.setScale(0.8);
			autoAttack.setFriction(0);
            autoAttack.setFrictionAir(0);
			autoAttack.setBounce(0.8);
			autoAttack.setMass(0.1);
			autoAttack.setVelocityX(velocity);
			autoAttack.setIgnoreGravity(true);
			autoAttack.setCollidesWith([this.state.enemyPlayerCollisions]);
			const projectileLifetime = this.state.time.addEvent({
				delay: 1000,
				callback: () => {
                    autoAttack.destroy();
                    projectileLifetime.destroy();
                }
			});
			this.state.playerAttacks.add(autoAttack);
			this.matterBody.first.anims.play(`${this.heroConfig.name}-attack`, true);
            this.lastAutoAttacked = time;
        }
    }

    private createAnimations(): void {
        for (let key in this.heroConfig.baseAnimationFrames) {
            let animation = this.heroConfig.baseAnimationFrames[key];
            this.state.anims.create({
                key: animation.key,
                frames: this.state.anims.generateFrameNames(this.heroConfig.spriteSheet, animation.frames),
                frameRate: animation.frameRate,
                repeat: animation.repeat
            });
        }
    }

    private createSensors(playerConfig: any, heroConfig: any): void {
        this.blocked = { left: false, right: false, bottom: false };
        this.numTouching = { left: 0, right: 0, bottom: 0 };
        this.sensors = { left: null, right: null, bottom: null };

		const M = Phaser.Physics.Matter.Matter;
		const w = this.width;
		const h = this.height;

		const playerBody = M.Bodies.rectangle(0, 5, w * 0.5, h * .85, { playerConfig, heroConfig, chamfer: { radius: 10 } });
		this.sensors.bottom = M.Bodies.rectangle(0, h * 0.5, w * 0.5, 5, { playerConfig, heroConfig, isSensor: true });
		this.sensors.left = M.Bodies.rectangle(-w * 0.45, 0, 5, h * 0.75, { playerConfig, heroConfig, isSensor: true });
		this.sensors.right = M.Bodies.rectangle(w * 0.45, 0, 5, h * 0.75, { playerConfig, heroConfig, isSensor: true });
		var compoundBody = M.Body.create({
			parts: [
				playerBody, this.sensors.bottom, this.sensors.left,
				this.sensors.right
			],
			friction: 0,
			restitution: 0,
            playerConfig,
            heroConfig
		});

		return compoundBody;
	}
}
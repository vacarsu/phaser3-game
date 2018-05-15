// import * as Phaser from 'phaser';
// import { State } from 'state';

// export class Hero {
// 	public hero: any;
// 	public currentHp: number;
// 	public container: any;
// 	public lastAutoAttacked: number = 0;
// 	public blocked: any =  {
// 		left: false,
// 		right: false,
// 		bottom: false
// 	};
// 	public numTouching: any = {
// 		left: 0,
// 		right: 0,
// 		bottom: 0
// 	};
// 	public sensors: any = {
// 		bottom: null,
// 		left: null,
// 		right: null
// 	};
// 	constructor(
// 		public gameState: State,
// 		public stats: HeroStats,
// 		public animations: any,
// 		public spriteName: string,
// 		public healthSprite: string
// 	) {
// 		this.currentHp = this.stats.hp;
// 	}

// 	public controls() {
// 		this.gameState.cursors = this.gameState.input.keyboard.addKeys({
// 			'up': Phaser.Input.Keyboard.KeyCodes.W,
// 			'down': Phaser.Input.Keyboard.KeyCodes.S,
// 			'left': Phaser.Input.Keyboard.KeyCodes.A,
// 			'right': Phaser.Input.Keyboard.KeyCodes.D,
// 			'space': Phaser.Input.Keyboard.KeyCodes.SPACE,
// 			'shift': Phaser.Input.Keyboard.KeyCodes.SHIFT,
// 			'ab1': Phaser.Input.Keyboard.KeyCodes.ONE,
// 			'ab2': Phaser.Input.Keyboard.KeyCodes.TWO,
// 			'ab3': Phaser.Input.Keyboard.KeyCodes.THREE
// 		});
// 	}

// 	public createSensors(clientId: string) {
// 		const M = Phaser.Physics.Matter.Matter;
// 		const w = this.container.width;
// 		const h = this.container.height;

// 		const playerBody = M.Bodies.rectangle(0, 5, w * 0.5, h * .85, { stats: this.stats, label: 'player', clientId, chamfer: { radius: 10 } });
// 		this.sensors.bottom = M.Bodies.rectangle(0, h * 0.5, w * 0.5, 5, { stats: this.stats, label: 'player',  clientId, isSensor: true });
// 		this.sensors.left = M.Bodies.rectangle(-w * 0.45, 0, 5, h * 0.75, { stats: this.stats, label: 'player', clientId, isSensor: true });
// 		this.sensors.right = M.Bodies.rectangle(w * 0.45, 0, 5, h * 0.75, { stats: this.stats, label: 'player', clientId, isSensor: true });
// 		var compoundBody = M.Body.create({
// 			parts: [
// 				playerBody, this.sensors.bottom, this.sensors.left,
// 				this.sensors.right
// 			],
// 			friction: 0.01,
// 			restitution: 0.05,
// 			stats: this.stats,
// 			label: 'player',
// 			clientId
// 		});

// 		return compoundBody;
// 	}

// 	public movement(time: number, delta: any): void {
// 		if (this.gameState.cursors.left.isDown) {
// 			this.gameState.player1.container.setVelocityX(-1 - this.stats.movementSpeed);
// 			this.gameState.room.send({ action: 'updateX', value: this.gameState.player1.container.x });
// 			this.gameState.room.send({ action: 'updateY', value: this.gameState.player1.container.y });
// 			this.container.first.flipX = true;
// 			this.gameState.room.send({ action: 'playAnim', value: 'walk-left' });
// 			this.container.first.anims.play(`${this.spriteName}-walk`, true);
// 		} else if (this.gameState.cursors.right.isDown) {
// 			this.gameState.player1.container.setVelocityX(1 + this.stats.movementSpeed);
// 			this.gameState.room.send({ action: 'updateX', value: this.gameState.player1.container.x });
// 			this.gameState.room.send({ action: 'updateY', value: this.gameState.player1.container.y });
// 			this.container.first.flipX = false;
// 			this.gameState.room.send({ action: 'playAnim', value: 'walk-right' });
// 			this.container.first.anims.play(`${this.spriteName}-walk`, true);
// 		} else if (this.gameState.player1.container && this.gameState.cursors.left.isUp && this.gameState.cursors.right.isUp) {
// 			this.gameState.player1.container.setVelocityX(0);
// 			this.gameState.room.send({ action: 'playAnim', value: 'idle' });
// 			this.container.first.anims.play(`${this.spriteName}-idle`, true);
// 		}

// 		if (this.gameState.cursors.space.isDown && this.blocked.bottom || this.gameState.cursors.up.isDown && this.blocked.bottom) {
// 			this.gameState.player1.container.setVelocityY(-10);
// 			this.gameState.room.send({ action: 'updateX', value: this.gameState.player1.container.x });
// 			this.gameState.room.send({ action: 'updateY', value: this.gameState.player1.container.y });
// 			this.gameState.room.send({ action: 'playAnim', value: 'jump' });
// 			this.container.first.anims.play(`${this.spriteName}-jump`, true);
// 		} else if (this.gameState.cursors.space.isUp && !this.blocked.bottom || this.gameState.cursors.up.isUp && !this.blocked.bottom) {
// 			this.gameState.room.send({ action: 'updateX', value: this.gameState.player1.container.x });
// 			this.gameState.room.send({ action: 'updateY', value: this.gameState.player1.container.y });
// 			this.gameState.room.send({ action: 'playAnim', value: 'fall' });
// 			this.container.first.anims.play(`${this.spriteName}-fall`, true);
// 		}

// 		if(this.gameState.cursors.shift.isDown && (time / 1000 - this.lastAutoAttacked / 1000) >= (1 / this.stats.attackSpeed)) {
// 			let spawnAt: number;
// 			let velocity: number;
// 			if (this.container.first.flipX) {
// 				spawnAt = this.container.x - 40;
// 				velocity = -6;
// 			} else {
// 				spawnAt = this.container.x + 40;
// 				velocity = 6;
// 			}
// 			console.log(spawnAt);
// 			const autoAttack = this.gameState.matter.add.image(
// 				spawnAt,
// 				this.container.y,
// 				'Fireball', null,
// 				{
// 					label: 'autoAttack',
// 					stats: this.stats,
// 					clientId: this.container.client,
// 					shape: { type: 'polygon', radius: 18 },
// 					ignorePointer: true
// 				}

// 			);
// 			autoAttack.setScale(0.8);
// 			autoAttack.setFriction(0);
// 			autoAttack.setFrictionAir(0);
// 			autoAttack.setBounce(0.8);
// 			autoAttack.setMass(0.1);
// 			autoAttack.setVelocityX(velocity);
// 			autoAttack.setIgnoreGravity(true);
// 			autoAttack.setCollidesWith([this.gameState.enemyPlayerCollisions]);
// 			const projectileLifetime = this.gameState.time.addEvent({
// 				delay: 1000,
// 				callback: () => autoAttack.destroy()
// 			});
// 			this.gameState.playerAttacks.add(autoAttack);
// 			this.container.first.anims.play(`${this.spriteName}-attack`, true);
// 			this.lastAutoAttacked = time;
// 		}
// 	}

// 	public renderSprite(clientId: string) {
// 		const startPoint = this.gameState.determineStartPoint(this.spriteName);
// 		const healthBar = this.gameState.add.image(0, -60, this.healthSprite);
// 		const hero = this.gameState.add.sprite(0, 0, this.spriteName);
// 		const container = this.gameState.add.container(100, 100, [ hero, healthBar ]);
// 		container.setSize(80, 110);
// 		this.container = this.gameState.matter.add.gameObject(container, {
// 			label: 'player',
// 			stats: this.stats,
// 			clientId: clientId
// 		});
// 		this.container
// 			.setExistingBody(this.createSensors(clientId))
// 			.thrustBack(0)
// 			.setFriction(1)
// 			.setFrictionAir(0.001)
// 			.setBounce(0.2)
// 			.setFixedRotation()
// 			.setPosition(0, 0);
// 		console.log(this.container);
// 	}
// }
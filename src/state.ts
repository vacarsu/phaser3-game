import * as Phaser from 'phaser';
import * as Colyseus from 'colyseus.js';
import { heroMap } from './heroes/hero-map';
import { Hero } from './heroes/hero';

export class State extends Phaser.Scene {
	client: any;
	room: any;
	map: Phaser.Tilemaps.Tilemap;
	allyPlayerCollisions: number;
	enemyPlayerCollisions: number;
	playerAttackCollisions: number;
	enemyAttackCollisions: number;
	cursors: any;
	player1: Hero;
	heroColor: string;
	playerMap: any = {};
	otherPlayers: any;
	playerAttacks: any;
	enemyAttacks: any;
	public preload () {
		const tileSize = { frameWidth: 124, frameHeight: 124 };
		const heroSize = { frameWidth: 80, frameHeight: 110 };
		this.load.tilemapTiledJSON('map', '../assets/maps/alpha-map.json');
		this.load.spritesheet('spritesheet_ground', '../assets/placeholders/Spritesheets/spritesheet_ground.png', tileSize);
		this.load.image('friendly_healthbar', '../assets/friendly-healthbar.png');
		this.load.image('enemy_healthbar', '../assets/enemy-healthbar.png');
		this.load.image('PinkBlock', '../assets/character-placeholder1.png');
		this.load.image('PinkBlockAuto', '../assets/pink-block-auto.png');
		this.load.image('Fireball', '../assets/placeholders/Particles/fireball.png');
		this.load.image('Fart', '../assets/placeholders/Particles/Fart/fart02.png');
		this.load.image('GreenBlock', '../assets/character-placeholder2.png');
		this.load.spritesheet('Adventurer', 'assets/placeholders/Heroes/Adventurer/adventurer_tilesheet.png', heroSize);
		this.load.spritesheet('Zombie', 'assets/placeholders/Heroes/Zombie/zombie_tilesheet.png', heroSize);
	}

	public create () {
		this.connectToServer();

		this.client.onOpen.add(() => {
			console.log('connection is now open');
		});

		this.room.onJoin.add(() => {
			this.map = this.make.tilemap({ key: 'map' });
    
			const groundTiles = this.map.addTilesetImage('spritesheet_ground');
			var groundLayer = this.map.createDynamicLayer('ground', groundTiles, 0, 0);
			this.map.setCollisionByProperty({ collides: true });
			groundLayer.setCollisionByExclusion([-1]);

			this.matter.world.convertTilemapLayer(groundLayer);
			this.matter.world.nextCategory();
			this.allyPlayerCollisions = this.matter.world.nextCategory();
			this.enemyPlayerCollisions = this.matter.world.nextCategory();
			this.playerAttackCollisions = this.matter.world.nextCategory();
			this.enemyAttackCollisions = this.matter.world.nextCategory();

			this.matter.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
			this.player1 = new Hero(this, this.client, heroMap[this.heroColor], 'friendly_healthbar'); //[this.heroColor](this, 'friendly_healthbar');
			this.player1.setupController();
			// this.player1.renderSprite(this.client.id);
			this.otherPlayers = this.add.group();
			this.playerAttacks = this.add.group();
			this.enemyAttacks = this.add.group();
			this.player1.matterBody.setCollisionCategory(this.allyPlayerCollisions);
			this.player1.matterBody.setCollidesWith([1, this.enemyAttackCollisions, this.otherPlayers]);
			// this.otherPlayers.setCollidesWith([this.playerAttackCollisions]);

			this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
			this.cameras.main.startFollow(this.player1.matterBody);
			this.cameras.main.setBackgroundColor('#ccccff');

			this.room.listen('players/:id', (change: any) => {
				if (change.operation === 'add' && change.path.id !== this.client.id) {
					this.addOtherPlayer(change);
				} else if (change.operation === 'remove') {
					this.removePlayer(change.path.id);
				}
			});

			this.room.listen('players/:id/:attribute', (change: any) => {
				this.updatePlayerPosition(change);
			});

			this.input.on('pointerdown', () => {
				this.matter.world.drawDebug = !this.matter.world.drawDebug;
				this.matter.world.debugGraphic.visible = this.matter.world.drawDebug;
				console.log(this.input.activePointer.x, this.input.activePointer.y);
			}, this);

			this.matter.world.on('beforeupdate', (event: any) => {
				this.player1.numTouching.left = 0;
				this.player1.numTouching.right = 0;
				this.player1.numTouching.bottom = 0;
			});

			this.matter.world.on('collisionstart', (event: any, bodyA: any, bodyB: any) => {
				if(bodyA.label === 'player' && bodyB.label === 'autoAttack') {
					console.log([bodyB, bodyA]);
					const player = this.playerMap[ bodyA.clientId ]
					player.matterBody.first.anims.play(
						`${player.heroConfig.name}-hurt`,
						true
					);
					if(bodyB.heroConfig.stats.spellPower !== 0) {
						const damage = (bodyB.heroConfig.stats.spellPower * 0.5 + bodyB.heroConfig.stats.baseAttackDamage) - player.heroConfig.stats.spellProtection;
						const hpBarWidth = player.matterBody.last.width;
						const healthAfterDamage = player.currentHp - damage;
						const hpPercentage = (healthAfterDamage / player.currentHp) * 100;
						player.matterBody.last.displayWidth = (hpPercentage / 100) * hpBarWidth;
						player.currentHp = healthAfterDamage;
						if (player.currentHp <= 0) {
							bodyA.parent.destroy();
						}
					} else {
						const damage = (bodyB.heroConfig.stats.physicalPower * 0.5 + bodyB.heroConfig.stats.baseAttackDamage) - player.heroConfig.stats.physicalProtection;
						const hpBarWidth = player.matterBody.last.width;
						const healthAfterDamage = player.currentHp - damage;
						const hpPercentage = (healthAfterDamage / player.currentHp) * 100;
						player.matterBody.last.displayWidth = (hpPercentage / 100) * hpBarWidth;
						player.currentHp = healthAfterDamage;
						if (player.currentHp <= 0) {
							bodyA.parent.destroy();
						}
					}
					bodyB.destroy();
				}
			});

			this.matter.world.on('collisionactive', (event: any, bodyA: any, bodyB: any) => {
				var playerBody = this.player1.matterBody;
				var left = this.player1.sensors.left;
				var right = this.player1.sensors.right;
				var bottom = this.player1.sensors.bottom;
		
				for (var i = 0; i < event.pairs.length; i++)
				{
					var bodyA = event.pairs[i].bodyA;
					var bodyB = event.pairs[i].bodyB;
		
					if (bodyA === playerBody || bodyB === playerBody)
					{
						continue;
					}
					else if (bodyA === bottom || bodyB === bottom)
					{
						this.player1.numTouching.bottom += 1;
					}
					else if ((bodyA === left && bodyB.isStatic) || (bodyB === left && bodyA.isStatic))
					{
						this.player1.numTouching.left += 1;
					}
					else if ((bodyA === right && bodyB.isStatic) || (bodyB === right && bodyA.isStatic))
					{
						this.player1.numTouching.right += 1;
					}
				}
			});

			this.matter.world.on('collisionend', function (event: any, bodyA: any, bodyB: any) {
				if (bodyA.label === 'autoAttack' && bodyB.label === 'player') {
					this.playerMap[ bodyB.clientId ].matterBody.first.anims.play(
						`${this.playerMap[ bodyB.clientId ].heroConfig.name}-idle`,
						true
					);
				} else if(bodyA.label === 'player' && bodyA.label === 'autoAttack') {
					this.playerMap[ bodyA.clientId ].matterBody.first.anims.play(
						`${this.playerMap[ bodyA.clientId ].heroConfig.name}-idle`,
						true
					);
				}
			});

			this.matter.world.on('afterupdate', (event: any) => {
				this.player1.blocked.right = this.player1.numTouching.right > 0 ? true : false;
				this.player1.blocked.left = this.player1.numTouching.left > 0 ? true : false;
				this.player1.blocked.bottom = this.player1.numTouching.bottom > 0 ? true : false;
			});
		});
	}

	public update(time: number, delta: any) {
		if (this.cursors) {
			this.player1.moveControls();
			this.player1.basicAttackControl(time, delta);
		}
	}

	private connectToServer() {
		this.heroColor = this.determineHero();
		const startPoint = this.determineStartPoint(this.heroColor);
		this.client = new Colyseus.Client('ws://localhost:3000');
		this.room = this.client.join('Main', { heroColor: this.heroColor, x: startPoint.x, y: startPoint.y });
	}

	private determineHero() {
		return (Math.floor(Math.random() * 2) == 0) ? 'Zorik' : 'Malik';
	}

	public determineStartPoint(heroColor: string) {
		let startPoint: any;
		if (heroColor === 'PinkBlock') {
			startPoint = { x: 300, y: 0 };
		} else {
			startPoint = { x: 400, y: 0 };
		}

		return startPoint;
	}

	private addOtherPlayer(client: any) {
		const startPoint = this.determineStartPoint(client.value.heroColor);
		let otherPlayer: Hero = new Hero(this, { clientId: client.path.id }, heroMap[client.value.heroColor], 'enemy_healthbar');

		otherPlayer.matterBody.setCollisionCategory(this.enemyPlayerCollisions);
		otherPlayer.matterBody.setCollidesWith([1, this.playerAttackCollisions]);
		this.otherPlayers.add(otherPlayer.matterBody);
		this.playerMap[client.path.id] = otherPlayer;
	}

	private updatePlayerPosition(client: any) {
		if (this.playerMap[ client.path.id ]) {
			this.otherPlayers.children.iterate((player: any) => {
				if (player === this.playerMap[ client.path.id ].matterBody) {
					if (client.path.attribute === 'x') {
						player.setPosition(client.value, player.y);
					} else if (client.path.attribute === 'y') {
						player.setPosition(player.x, client.value);
					}

					if (client.path.attribute === 'animation') {
						if (client.value === 'walk-left') {
							player.first.flipX = true;
							player.first.anims.play(`${this.playerMap[ client.path.id ].heroConfig.name}-walk`, true);
						} else if (client.value === 'walk-right') {
							player.first.flipX = false;
							player.first.anims.play(`${this.playerMap[ client.path.id ].heroConfig.name}-walk`, true);
						} else {
							player.first.anims.play(`${this.playerMap[ client.path.id ].heroConfig.name}-${client.value}`, true);
						}
					}
				}
			});
		}
	}

	private removePlayer(id: any) {
		this.otherPlayers.children.iterate((player: any) => {
			if (player === this.playerMap[ id ].matterBody) {
				this.playerMap[ id ].matterBody.destroy();
				delete this.playerMap[id];
			}
		});
	}
}
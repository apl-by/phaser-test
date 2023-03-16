import "phaser";

export default class Game extends Phaser.Scene {
  private player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | undefined;
  private stars: Phaser.Physics.Arcade.Group | undefined;
  private bombs: Phaser.Physics.Arcade.Group | undefined;
  private bullets: Phaser.Physics.Arcade.Group | undefined;
  private platforms: Phaser.Physics.Arcade.StaticGroup | undefined;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  private score: number;
  private gameOver: boolean;
  private scoreText: Phaser.GameObjects.Text | undefined;
  private timeStamp: number;

  constructor() {
    super("game");
    this.player = undefined;
    this.stars = undefined;
    this.bombs = undefined;
    this.bullets = undefined;
    this.platforms = undefined;
    this.cursors = undefined;
    this.score = 0;
    this.gameOver = false;
    this.scoreText = undefined;
    this.timeStamp = Date.now();
  }
  init() {
    this.player = undefined;
    this.stars = undefined;
    this.bombs = undefined;
    this.bullets = undefined;
    this.platforms = undefined;
    this.cursors = undefined;
    this.score = 0;
    this.gameOver = false;
    this.scoreText = undefined;
    this.timeStamp = Date.now();
  }

  preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.image("ground", "assets/platform.png");
    this.load.image("star", "assets/star.png");
    this.load.image("bomb", "assets/bomb.png");
    this.load.image("bullet", "assets/bullet.png");
    this.load.spritesheet("dude", "assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create() {
    //  A simple background for our game
    this.add.image(400, 300, "sky");

    //  The platforms group contains the ground and the 2 ledges we can jump on
    this.platforms = this.physics.add.staticGroup();

    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    this.platforms.create(400, 568, "ground").setScale(2).refreshBody();

    //  Now let's create some ledges
    this.platforms.create(600, 400, "ground");
    this.platforms.create(50, 250, "ground");
    this.platforms.create(750, 220, "ground");

    // The player and its settings
    this.player = this.physics.add.sprite(100, 450, "dude");

    //  Player physics properties. Give the little guy a slight bounce.
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    //  Our player animations, turning, walking left and walking right.
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    //  Input Events
    this.cursors = this.input.keyboard.createCursorKeys();

    //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    this.stars = this.physics.add.group({
      key: "star",
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    });

    this.stars.children.iterate(function (child) {
      //  Give each star a slightly different bounce
      (child as Phaser.Physics.Arcade.Sprite).setBounceY(
        Phaser.Math.FloatBetween(0.4, 0.8)
      );
    });

    this.bombs = this.physics.add.group();
    this.bullets = this.physics.add.group({
      allowGravity: false,
      runChildUpdate: true,
    });

    //  The score
    this.scoreText = this.add.text(16, 16, "score: 0", {
      fontSize: "32px",
      color: "#000",
    });

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.collider(this.bombs, this.platforms);
    this.physics.add.collider(
      this.bullets,
      this.platforms,
      this.getOutWorld as any
    );

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    this.physics.add.overlap(
      this.player,
      this.stars,
      this.collectStar,
      undefined,
      this
    );

    this.physics.add.overlap(
      this.bombs,
      this.bullets,
      this.dissapear,
      undefined,
      this
    );

    this.physics.add.collider(
      this.player,
      this.bombs,
      this.hitBomb as any,
      undefined,
      this
    );
    console.log(this);
  }

  update() {
    if (!this.cursors || !this.player) return;
    if (this.gameOver) return;

    if (this.cursors.left.isDown) {
      if (this.cursors.space.isDown) {
        this.createBullet("left");
      }
      this.player.setVelocityX(-160);
      this.player.anims.play("left", true);
      return;
    }
    if (this.cursors.right.isDown) {
      if (this.cursors.space.isDown) {
        this.createBullet("right");
      }
      this.player.setVelocityX(160);
      this.player.anims.play("right", true);

      return;
    }
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      if (this.cursors.space.isDown) {
        this.createBullet("up");
      }
      this.player.setVelocityY(-330);
      return;
    }
    if (this.cursors.space.isDown) {
      this.createBullet("up");
    }
    this.player.setVelocityX(0);
    this.player.anims.play("turn");
  }

  collectStar(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    star: Phaser.GameObjects.GameObject
  ) {
    if (!this.scoreText || !this.stars || !this.bombs) return;

    (star as Phaser.Physics.Arcade.Sprite).disableBody(true, true);

    //  Add and update the score
    this.score += 10;
    this.scoreText.setText("Score: " + this.score);

    if (this.stars.countActive(true) === 0) {
      //  A new batch of stars to collect
      this.stars.children.iterate(function (child) {
        (child as Phaser.Physics.Arcade.Sprite).enableBody(
          true,
          (child as Phaser.Physics.Arcade.Sprite).x,
          0,
          true,
          true
        );
      });

      const x =
        (player as Phaser.Physics.Arcade.Sprite).x < 400
          ? Phaser.Math.Between(400, 800)
          : Phaser.Math.Between(0, 400);

      const bomb = this.bombs.create(x, 16, "bomb");
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
      bomb.setGravity(0);
    }
  }

  hitBomb(
    player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
    bomb: any
  ) {
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play("turn");

    this.gameOver = true;

    this.time.delayedCall(1000, () => {
      this.scene.resume("game");
      this.scene.start("start-screen");
    });
  }

  createBullet(direction: string) {
    if (!this.bullets || !this.player || !this.scoreText) return;
    if (this.score === 0) return;
    const currentTimeStamp = Date.now();
    if (currentTimeStamp - this.timeStamp < 300) return;

    const { x, y } = this.player;
    const bullet = this.bullets.create(x, y, "bullet");
    bullet.setCollideWorldBounds(true);
    bullet.body.onWorldBounds = true;
    bullet.body.world.on("worldbounds", function (body: any) {
      // Check if the body's game object is the bullet you are listening for
      if (body.gameObject === bullet) {
        // Stop physics and render updates for this object
        bullet.disableBody(true, true);
      }
    });
    if (direction === "left") {
      bullet.setVelocityX(-400);
    }
    if (direction === "right") {
      bullet.setVelocityX(400);
    }
    if (direction === "up") {
      bullet.setVelocityY(-400);
    }

    this.timeStamp = currentTimeStamp;
    this.score -= 1;
    this.scoreText.setText("Score: " + this.score);
  }

  getOutWorld(bullet: any, platforms: any) {
    bullet.disableBody(true, true);
  }

  dissapear(bomb: any, bullet: any) {
    bomb.disableBody(true, true);
    bullet.disableBody(true, true);
  }
}

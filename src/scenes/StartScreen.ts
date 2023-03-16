import "phaser";

export default class StartScreen extends Phaser.Scene {
  private buttons: Phaser.Physics.Arcade.StaticGroup | undefined;

  constructor() {
    super("start-screen");
    this.buttons = undefined;
  }

  preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.image("left", "assets/left.png");
    this.load.image("right", "assets/right.png");
    this.load.image("up", "assets/up.png");
    this.load.image("space", "assets/space.png");
    this.load.image("start", "assets/start.png");
  }

  create() {
    this.add.image(400, 300, "sky");

    this.buttons = this.physics.add.staticGroup();

    this.buttons.create(400, 200, "start");
    this.buttons.create(200, 300, "left");
    this.buttons.create(200, 364, "right");
    this.buttons.create(200, 428, "up");
    this.buttons.create(200, 492, "space").setScale(0.7).refreshBody();

    const textStyle = { fontSize: "32px", color: "#000" };

    this.add.text(350, 225, "жми Enter", { fontSize: "20px", color: "#000" });
    this.add.text(250, 280, "- влево", textStyle);
    this.add.text(250, 344, "- вправо", textStyle);
    this.add.text(250, 408, "- прыжок", textStyle);
    this.add.text(250, 472, "- выстрел", textStyle);

    const enter = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ENTER
    );

    enter.on("down", () => {
      this.scene.start("game");
    });
  }

  update() {}
}

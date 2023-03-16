import Game from "./scenes/Game";
import StartScreen from "./scenes/StartScreen";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: [StartScreen, Game],
};

const game = new Phaser.Game(config);

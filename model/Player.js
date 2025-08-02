class Player {
  constructor(id) {
    this.id = id;
    this.x = 50;
    this.y = 250;
    this.width = 30;
    this.height = 30;
    this.up = false;
    this.down = false;
    this.left = false;
    this.right = false;
    this.speed = 10;
  }
  updatePos() {
    if (this.up) {
      this.y -= this.speed;
    }
    if (this.down) {
      this.y += this.speed;
    }
    if (this.left) {
      this.x -= this.speed;
    }
    if (this.right) {
      this.x += this.speed;
    }
  }
}

module.exports = { Player };

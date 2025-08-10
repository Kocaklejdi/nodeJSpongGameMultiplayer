class Player {
  constructor(id, x, y) {
    this.id = id;
    this.x = x;
    this.y = y;
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

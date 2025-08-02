class Bullet {
  constructor(id, x, y, dx, dy) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.travelDist = 0;
    this.maxTravelDist = 10e10 * 10e10;
    this.delete = false;
  }
  updatePos() {
    this.x += this.dx;
    this.y += this.dy;
    this.travelDist +=
      this.travelDist + (this.dx * this.dx + this.dy * this.dy);
    if (this.travelDist > this.maxTravelDist) {
      this.delete = true;
    }
  }
}
module.exports = { Bullet };

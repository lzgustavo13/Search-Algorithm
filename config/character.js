export class Character {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  draw(color, tileSize) {
    fill(color);
    rect(this.x * tileSize, this.y * tileSize, tileSize, tileSize);
  }

  update(dir) {
    if (!dir) return;
    this.x = dir.x;
    this.y = dir.y;
  }
}

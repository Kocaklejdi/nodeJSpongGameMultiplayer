const { Player } = require("./model/Player");
const { Bullet } = require("./model/Bullet");
const { worldMap } = require("./model/World");

const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server, {});

app.get("/", (req, res) => res.sendFile(__dirname + "/client/index.html"));
app.use("/client", express.static(__dirname + "/client"));

server.listen(2000);
console.log("Server started on port 2000");

const SOCKET_LIST = {};
const PLAYER_LIST = {};
const BULLET_LIST = {};

io.sockets.on("connection", (socket) => {
  const player = new Player(socket.id, 100, 100);
  PLAYER_LIST[socket.id] = player;
  SOCKET_LIST[socket.id] = socket;

  console.log("Socket connected:", socket.id);

  socket.emit("initGameWorld", worldMap);

  socket.on("disconnect", () => {
    delete SOCKET_LIST[socket.id];
    delete PLAYER_LIST[socket.id];
    console.log("Socket disconnected:", socket.id);
  });

  socket.on("keypress", (data) => {
    if (data.inputId === "left") player.left = data.state;
    if (data.inputId === "right") player.right = data.state;
    if (data.inputId === "down") player.down = data.state;
    if (data.inputId === "up") player.up = data.state;
  });

  socket.on("shoot", (data) => {
    const dx = data.x - data.player.x;
    const dy = data.y - data.player.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const id = Math.random().toString();
    BULLET_LIST[id] = new Bullet(
      id,
      data.player.x,
      data.player.y,
      (dx / length) * 10,
      (dy / length) * 10
    );
  });
});

setInterval(() => {
  const pack = [];
  const bullets = [];

  Object.values(PLAYER_LIST).forEach((player) => {
    // Backup original position before trying to move
    const oldX = player.x;
    const oldY = player.y;

    player.updatePos();

    // Check collision against all solid tiles
    let collided = false;
    worldMap.forEach((row, yIndex) => {
      row.forEach((tile, xIndex) => {
        if (tile === 1) {
          const wall = {
            x: xIndex * 50,
            y: yIndex * 50,
            width: 50,
            height: 50,
          };

          if (
            checkCollision(
              {
                x: player.x,
                y: player.y,
                width: player.width,
                height: player.height,
              },
              wall
            )
          ) {
            collided = true;
          }
        }
      });
    });

    // If collided, reset to old position
    if (collided) {
      player.x = oldX;
      player.y = oldY;
    }

    pack.push({ id: player.id, x: player.x, y: player.y });
  });

  Object.values(BULLET_LIST).forEach((bullet) => {
    bullet.updatePos();
    if (bullet.delete) {
      delete BULLET_LIST[bullet.id];
    }
    bullets.push(bullet);
  });

  Object.values(SOCKET_LIST).forEach((socket) => {
    const playerState = pack.map((p) => ({
      ...p,
      self: p.id === socket.id,
    }));

    socket.emit("newPos", {
      id: socket.id,
      playerState: playerState,
      bullets: bullets,
      worldMap: worldMap,
    });
  });
}, 1000 / 30);

function checkCollision(rect1, rect2) {
  if (rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x) {
    if (rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y) {
      return true;
    }
  }
  return false;
}

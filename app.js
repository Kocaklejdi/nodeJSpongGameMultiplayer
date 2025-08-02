const { Player } = require("./model/Player");
const { Bullet } = require("./model/Bullet");

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
  const player = new Player(socket.id);
  PLAYER_LIST[socket.id] = player;
  SOCKET_LIST[socket.id] = socket;

  console.log("Socket connected:", socket.id);

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
    player.updatePos();
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
    const playerState = pack.map((player) => ({
      ...player,
      self: player.id === socket.id,
    }));

    socket.emit("newPos", {
      id: socket.id,
      playerState: playerState,
      bullets: bullets,
    });
  });
}, 1000 / 60);

const rooms = {};

// 🎨 Random color
function getRandomColor() {
  const colors = ["green", "blue", "red", "yellow"];
  return colors[Math.floor(Math.random() * colors.length)];
}

// 🔢 Room code
function generateRoomCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function socketHandler(io) {

  io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    // track which room this socket belongs to
    socket.roomCode = null;

    // =========================
    // CREATE ROOM
    // =========================
    socket.on("createRoom", () => {

      const roomCode = generateRoomCode();

      rooms[roomCode] = {
        players: [],
        snakes: {},
        food: { x: 10, y: 10 },
        interval: null
      };

      rooms[roomCode].players.push({ id: socket.id });

      rooms[roomCode].snakes[socket.id] = {
        body: [{ x: 5, y: 5 }],
        direction: "RIGHT",
        color: getRandomColor()
      };

      socket.join(roomCode);
      socket.roomCode = roomCode;

      socket.emit("roomCreated", roomCode);

      io.to(roomCode).emit("gameState", {
        snakes: rooms[roomCode].snakes,
        food: rooms[roomCode].food
      });

      console.log("Room created:", roomCode);
    });

    // =========================
    // JOIN ROOM
    // =========================
    socket.on("joinRoom", (roomCode) => {

      const room = rooms[roomCode];
      if (!room) return;

      if (room.players.length >= 4) return;

      if (room.players.some(p => p.id === socket.id)) return;

      room.players.push({ id: socket.id });

      room.snakes[socket.id] = {
        body: [{
          x: Math.floor(Math.random() * 10),
          y: Math.floor(Math.random() * 10)
        }],
        direction: "RIGHT",
        color: getRandomColor()
      };

      socket.join(roomCode);
      socket.roomCode = roomCode;

      io.to(roomCode).emit("gameState", {
        snakes: room.snakes,
        food: room.food
      });

      console.log("Player joined:", roomCode);
    });

    // =========================
    // GET STATE (VERY IMPORTANT)
    // =========================
    socket.on("getState", (roomCode) => {

      const room = rooms[roomCode];
      if (!room) return;

      socket.emit("gameState", {
        snakes: room.snakes,
        food: room.food
      });

    });

    // =========================
    // PLAYER INPUT
    // =========================
    socket.on("move", (direction) => {

      const roomCode = socket.roomCode;
      const room = rooms[roomCode];
      if (!room) return;

      const snake = room.snakes[socket.id];
      if (!snake) return;

      const current = snake.direction;

      if (
        (direction === "UP" && current !== "DOWN") ||
        (direction === "DOWN" && current !== "UP") ||
        (direction === "LEFT" && current !== "RIGHT") ||
        (direction === "RIGHT" && current !== "LEFT")
      ) {
        snake.direction = direction;
      }

    });

    // =========================
    // START GAME
    // =========================
    socket.on("startGame", (roomCode) => {

      const room = rooms[roomCode];
      if (!room) return;

      // 🔥 SEND STATE IMMEDIATELY (fix blank board)
      io.to(roomCode).emit("gameState", {
        snakes: room.snakes,
        food: room.food
      });

      // prevent duplicate loops
      if (room.interval) return;

      room.interval = setInterval(() => {

        for (const id in room.snakes) {

          const snake = room.snakes[id];
          const head = { ...snake.body[0] };

          // movement
          if (snake.direction === "UP") head.y -= 1;
          if (snake.direction === "DOWN") head.y += 1;
          if (snake.direction === "LEFT") head.x -= 1;
          if (snake.direction === "RIGHT") head.x += 1;

          // wrap walls
          if (head.x < 0) head.x = 19;
          if (head.x >= 20) head.x = 0;
          if (head.y < 0) head.y = 19;
          if (head.y >= 20) head.y = 0;

          snake.body.unshift(head);

          // food
          if (head.x === room.food.x && head.y === room.food.y) {
            room.food = {
              x: Math.floor(Math.random() * 20),
              y: Math.floor(Math.random() * 20)
            };
          } else {
            snake.body.pop();
          }

        }

        io.to(roomCode).emit("gameState", {
          snakes: room.snakes,
          food: room.food
        });

      }, 200);

      io.to(roomCode).emit("gameStarted");

      console.log("Game started:", roomCode);
    });

    // =========================
    // LEAVE ROOM
    // =========================
    socket.on("leaveRoom", () => {

      const roomCode = socket.roomCode;
      const room = rooms[roomCode];
      if (!room) return;

      delete room.snakes[socket.id];
      room.players = room.players.filter(p => p.id !== socket.id);

      socket.leave(roomCode);
      socket.roomCode = null;

      io.to(roomCode).emit("gameState", {
        snakes: room.snakes,
        food: room.food
      });

    });

    // =========================
    // DISCONNECT
    // =========================
    socket.on("disconnect", () => {

      const roomCode = socket.roomCode;
      const room = rooms[roomCode];
      if (!room) return;

      delete room.snakes[socket.id];
      room.players = room.players.filter(p => p.id !== socket.id);

      io.to(roomCode).emit("gameState", {
        snakes: room.snakes,
        food: room.food
      });

      if (room.players.length === 0) {
        clearInterval(room.interval);
        delete rooms[roomCode];
      }

      console.log("User disconnected:", socket.id);

    });

  });

}

module.exports = socketHandler;
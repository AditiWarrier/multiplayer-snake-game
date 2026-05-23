const rooms = {};

const GRID_SIZE = 30;
const COLORS = ["#00ff88", "#00cfff", "#ff4d6d", "#ffd60a", "#c77dff", "#ff9a3c"];

function getColor(index) {
  return COLORS[index % COLORS.length];
}

function generateRoomCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function spawnFood(room) {
  let pos;

  do {
    pos = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
  } while (
    Object.values(room.snakes).some(s =>
      s.alive &&
      s.body.some(b => b.x === pos.x && b.y === pos.y)
    )
  );

  return pos;
}

function getStartPositions() {
  return [
    { x: 5, y: 5 },
    { x: 24, y: 24 },
    { x: 5, y: 24 },
    { x: 24, y: 5 }
  ];
}

function broadcastState(io, roomCode) {
  const room = rooms[roomCode];

  if (!room) {
    console.log("BROADCAST FAILED:", roomCode);
    return;
  }

  io.to(roomCode).emit("gameState", {
    snakes: room.snakes,
    food: room.food,
    foodTrail: room.foodTrail || [],
    scores: room.scores,
    gameOver: room.gameOver,
    winner: room.winner
  });
}

function socketHandler(io) {

  io.on("connection", (socket) => {

    console.log("CONNECTED:", socket.id);

    socket.roomCode = null;

    // =====================================================
    // CREATE ROOM
    // =====================================================

    socket.on("createRoom", () => {

      const roomCode = generateRoomCode();

      rooms[roomCode] = {
        players: [],
        snakes: {},
        food: { x: 15, y: 15 },
        scores: {},
        interval: null,
        started: false,
        gameOver: false,
        winner: null,
        foodTrail: []
      };

      rooms[roomCode].players.push({
        id: socket.id,
        colorIndex: 0
      });

      rooms[roomCode].snakes[socket.id] = {
        body: [getStartPositions()[0]],
        direction: "RIGHT",
        color: getColor(0),
        alive: true
      };

      rooms[roomCode].scores[socket.id] = 0;

      socket.join(roomCode);
      socket.roomCode = roomCode;

      socket.emit("roomCreated", roomCode);

      broadcastState(io, roomCode);
    });

    // =====================================================
    // JOIN ROOM
    // =====================================================

    socket.on("joinRoom", (roomCode) => {

      const room = rooms[roomCode];

      if (!room) return;

      // Rejoin existing
      if (room.players.some(p => p.id === socket.id)) {

        socket.join(roomCode);
        socket.roomCode = roomCode;

        broadcastState(io, roomCode);

        return;
      }

      if (room.players.length >= 4) return;

      const colorIndex = room.players.length;

      room.players.push({
        id: socket.id,
        colorIndex
      });

      room.snakes[socket.id] = {
        body: [getStartPositions()[colorIndex]],
        direction: "RIGHT",
        color: getColor(colorIndex),
        alive: true
      };

      room.scores[socket.id] = 0;

      socket.join(roomCode);
      socket.roomCode = roomCode;

      broadcastState(io, roomCode);
    });

    // =====================================================
    // GET STATE
    // =====================================================

    socket.on("getState", (roomCode) => {

      const room = rooms[roomCode];

      if (!room) return;

      socket.join(roomCode);
      socket.roomCode = roomCode;

      broadcastState(io, roomCode);
    });

    // =====================================================
    // MOVE
    // =====================================================

    socket.on("move", (direction) => {

      const room = rooms[socket.roomCode];

      if (!room) return;

      const snake = room.snakes[socket.id];

      if (!snake || !snake.alive) return;

      const opposites = {
        UP: "DOWN",
        DOWN: "UP",
        LEFT: "RIGHT",
        RIGHT: "LEFT"
      };

      if (opposites[direction] !== snake.direction) {
        snake.direction = direction;
      }
    });

    // =====================================================
    // START GAME
    // =====================================================

    socket.on("startGame", (roomCode) => {

      const room = rooms[roomCode];

      if (!room || room.interval) return;

      room.started = true;
      room.tickCount = 0;
      room.lastDeathTick = false;

      io.to(roomCode).emit("gameStarted");

      broadcastState(io, roomCode);

      // ✅ REAL COUNTDOWN DELAY
      setTimeout(() => {

        room.interval = setInterval(() => {

          room.tickCount++;

          const deaths = [];

          // =========================================
          // STEP 1: NEXT HEAD POSITIONS
          // =========================================

          const nextHeads = {};

          for (const id in room.snakes) {

            const snake = room.snakes[id];

            if (!snake.alive) continue;

            const head = { ...snake.body[0] };

            if (snake.direction === "UP") head.y -= 1;
            if (snake.direction === "DOWN") head.y += 1;
            if (snake.direction === "LEFT") head.x -= 1;
            if (snake.direction === "RIGHT") head.x += 1;

            // WALL COLLISION
            if (
              head.x < 0 ||
              head.x >= GRID_SIZE ||
              head.y < 0 ||
              head.y >= GRID_SIZE
            ) {
              deaths.push(id);
              continue;
            }

            nextHeads[id] = head;
          }

          // =========================================
          // STEP 2: HEAD TO HEAD
          // =========================================

          const positionMap = {};

          for (const id in nextHeads) {

            const pos = nextHeads[id];

            const key = `${pos.x},${pos.y}`;

            if (!positionMap[key]) {
              positionMap[key] = [];
            }

            positionMap[key].push(id);
          }

          for (const key in positionMap) {

            if (positionMap[key].length > 1) {
              deaths.push(...positionMap[key]);
            }
          }

          // =========================================
          // STEP 3: BODY COLLISIONS
          // =========================================

          for (const id in nextHeads) {

            if (deaths.includes(id)) continue;

            const head = nextHeads[id];
            const snake = room.snakes[id];

            const selfHit = snake.body
              .slice(1)
              .some(b => b.x === head.x && b.y === head.y);

            let otherHit = false;

            for (const otherId in room.snakes) {

              if (otherId === id) continue;

              const other = room.snakes[otherId];

              if (!other.alive) continue;

              if (
                other.body.some(
                  b => b.x === head.x && b.y === head.y
                )
              ) {
                otherHit = true;
                break;
              }
            }

            if (selfHit || otherHit) {
              deaths.push(id);
              continue;
            }

            snake.body.unshift(head);

            // FOOD
            if (
              head.x === room.food.x &&
              head.y === room.food.y
            ) {

              room.scores[id] += 1;

              room.food = spawnFood(room);

            } else {

              snake.body.pop();
            }
          }

          // =========================================
          // STEP 4: APPLY DEATHS
          // =========================================

          deaths.forEach(id => {

            const snake = room.snakes[id];

            if (!snake) return;

            snake.alive = false;

            snake.body.forEach((seg, i) => {

              if (i % 2 === 0) {
                room.foodTrail.push(seg);
              }
            });

            snake.body = [];
          });

          // =========================================
          // STEP 5: GAME OVER
          // =========================================

          const alive = Object.keys(room.snakes)
            .filter(id => room.snakes[id].alive);

          // ✅ ONLY end when ONE snake remains
          if (
            alive.length === 1 &&
            Object.keys(room.snakes).length > 1
          ) {

            room.gameOver = true;
            room.winner = alive[0];

            clearInterval(room.interval);

            room.interval = null;

            broadcastState(io, roomCode);

            return;
          }

          broadcastState(io, roomCode);

        }, 200);

      }, 3000); // ✅ 3 SECOND COUNTDOWN
    });

    // =====================================================
    // LEAVE ROOM
    // =====================================================

    socket.on("leaveRoom", (roomCode) => {

      const room = rooms[roomCode];

      if (!room) return;

      socket.leave(roomCode);

      socket.roomCode = null;

      const playerIndex =
        room.players.findIndex(
          p => p.id === socket.id
        );

      if (playerIndex !== -1) {

        room.players.splice(playerIndex, 1);

        delete room.snakes[socket.id];
        delete room.scores[socket.id];
      }

      broadcastState(io, roomCode);

      if (room.players.length === 0) {

        setTimeout(() => {

          if (
            rooms[roomCode] &&
            rooms[roomCode].players.length === 0
          ) {

            clearInterval(rooms[roomCode].interval);

            delete rooms[roomCode];
          }

        }, 10000);
      }
    });

    // =====================================================
    // DISCONNECT
    // =====================================================

    socket.on("disconnect", () => {

      const roomCode = socket.roomCode;

      const room = rooms[roomCode];

      if (!room) return;

      delete room.snakes[socket.id];
      delete room.scores[socket.id];

      room.players =
        room.players.filter(
          p => p.id !== socket.id
        );

      broadcastState(io, roomCode);

      if (room.players.length === 0) {

        setTimeout(() => {

          if (
            rooms[roomCode] &&
            rooms[roomCode].players.length === 0
          ) {

            clearInterval(rooms[roomCode].interval);

            delete rooms[roomCode];
          }

        }, 10000);
      }
    });
  });
}

module.exports = socketHandler;
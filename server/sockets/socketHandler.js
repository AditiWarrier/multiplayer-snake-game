const rooms = {};

const GRID_SIZE = 30;
const COLORS = ["#00ff88", "#00cfff", "#ff4d6d", "#ffd60a", "#c77dff", "#ff9a3c"];

function getColor(index) {
  return COLORS[index % COLORS.length];
}

function generateRoomCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
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
      s.alive && s.body.some(b => b.x === pos.x && b.y === pos.y)
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
    console.log("BROADCAST FAILED: Room not found", roomCode);
    return;
  }

  const state = {
    snakes: room.snakes,
    food: room.food,
    foodTrail: room.foodTrail || [],
    scores: room.scores,
    gameOver: room.gameOver,
    winner: room.winner
  };

  console.log("EMIT STATE:", roomCode, "SNAKES:", Object.keys(room.snakes), "PLAYERS:", room.players.length);
  io.to(roomCode).emit("gameState", state);
}

function socketHandler(io) {
  io.on("connection", (socket) => {
    console.log("Connected:", socket.id);
    socket.roomCode = null;

    socket.on("createRoom", () => {
      const roomCode = generateRoomCode();
      console.log("CREATE ROOM:", socket.id, roomCode);

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

      rooms[roomCode].players.push({ id: socket.id, colorIndex: 0 });

      rooms[roomCode].snakes[socket.id] = {
        body: [getStartPositions()[0]],
        direction: "RIGHT",
        color: getColor(0),
        alive: true
      };

      rooms[roomCode].scores[socket.id] = 0;

      socket.join(roomCode);
      socket.roomCode = roomCode;
      console.log("JOIN:", socket.id, roomCode, "socket.roomCode SET");

      socket.emit("roomCreated", roomCode);
      broadcastState(io, roomCode);
    });

    socket.on("joinRoom", (roomCode) => {
      const room = rooms[roomCode];
      if (!room) {
        console.log("JOIN ROOM FAILED: Room not found", socket.id, roomCode);
        return;
      }

      // Already a player — just re-join the socket.io room (page navigation)
      if (room.players.some(p => p.id === socket.id)) {
        console.log("RE-JOIN EXISTING:", socket.id, roomCode);
        socket.join(roomCode);
        socket.roomCode = roomCode;
        broadcastState(io, roomCode);
        return;
      }

      if (room.players.length >= 4) {
        console.log("JOIN ROOM FAILED: Room full", socket.id, roomCode);
        return;
      }

      const colorIndex = room.players.length;
      console.log("NEW PLAYER JOIN:", socket.id, roomCode, "COLOR:", colorIndex);

      room.players.push({ id: socket.id, colorIndex });

      room.snakes[socket.id] = {
        body: [getStartPositions()[colorIndex]],
        direction: "RIGHT",
        color: getColor(colorIndex),
        alive: true
      };

      room.scores[socket.id] = 0;
      console.log("SNAKES AFTER JOIN:", Object.keys(room.snakes));

      socket.join(roomCode);
      socket.roomCode = roomCode;
      console.log("JOIN:", socket.id, roomCode, "socket.roomCode SET");

      broadcastState(io, roomCode);
    });

    socket.on("getState", (roomCode) => {
      const room = rooms[roomCode];
      if (!room) {
        console.log("GET STATE FAILED: Room not found", socket.id, roomCode);
        return;
      }

      console.log("GET STATE:", socket.id, roomCode, "CURRENT SNAKES:", Object.keys(room.snakes));

      // Re-join socket.io room (handles page navigation losing context)
      socket.join(roomCode);
      socket.roomCode = roomCode;
      console.log("GET STATE - JOINED ROOM:", socket.id, roomCode);

      // If socket is a known player but snake is missing, restore it
      const playerEntry = room.players.find(p => p.id === socket.id);
      if (playerEntry && !room.snakes[socket.id]) {
        console.log("RESTORING MISSING SNAKE FOR:", socket.id);
        room.snakes[socket.id] = {
          body: [getStartPositions()[playerEntry.colorIndex]],
          direction: "RIGHT",
          color: getColor(playerEntry.colorIndex),
          alive: !room.started // If game started, dead snake; otherwise alive
        };
        room.scores[socket.id] = room.scores[socket.id] || 0;
        console.log("SNAKES AFTER RESTORE:", Object.keys(room.snakes));
      }

      // Broadcast to everyone so all boards refresh
      broadcastState(io, roomCode);
    });

    socket.on("move", (direction) => {
      const room = rooms[socket.roomCode];
      if (!room) {
        console.log("MOVE FAILED: No room for socket", socket.id, socket.roomCode);
        return;
      }

      const snake = room.snakes[socket.id];
      if (!snake || !snake.alive) {
        console.log("MOVE FAILED: No snake or dead", socket.id);
        return;
      }

      const opposites = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };

      if (opposites[direction] !== snake.direction) {
        snake.direction = direction;
        console.log("MOVE:", socket.id, direction, "ROOM:", socket.roomCode);
      }
    });

    socket.on("startGame", (roomCode) => {
      const room = rooms[roomCode];
      if (!room || room.interval) return;

      console.log("START GAME:", roomCode, "SNAKES IN GAME:", Object.keys(room.snakes));
      room.started = true;

      io.to(roomCode).emit("gameStarted");

// 🔥 FORCE FULL STATE PUSH IMMEDIATELY
broadcastState(io, roomCode);

      room.interval = setInterval(() => {
        console.log("LOOP PLAYERS:", Object.keys(room.snakes));
        const deaths = [];
        console.log("GAME LOOP TICK - SNAKES:", Object.keys(room.snakes));

        for (const id in room.snakes) {
          const snake = room.snakes[id];
          if (!snake.alive) continue;

          const head = { ...snake.body[0] };

          if (snake.direction === "UP") head.y -= 1;
          if (snake.direction === "DOWN") head.y += 1;
          if (snake.direction === "LEFT") head.x -= 1;
          if (snake.direction === "RIGHT") head.x += 1;

          head.x = (head.x + GRID_SIZE) % GRID_SIZE;
          head.y = (head.y + GRID_SIZE) % GRID_SIZE;

          const selfHit = snake.body.slice(1).some(b => b.x === head.x && b.y === head.y);

          let otherHit = false;
          for (const otherId in room.snakes) {
            if (otherId === id) continue;
            const other = room.snakes[otherId];
            if (!other.alive) continue;
            if (other.body.some(b => b.x === head.x && b.y === head.y)) {
              otherHit = true;
              break;
            }
          }

          if (selfHit || otherHit) {
            deaths.push(id);
            continue;
          }

          snake.body.unshift(head);

          if (head.x === room.food.x && head.y === room.food.y) {
            room.scores[id] += 1;
            room.food = spawnFood(room);
          } else {
            snake.body.pop();
          }
        }

        deaths.forEach(id => {
          const snake = room.snakes[id];
          snake.alive = false;
          snake.body.forEach((seg, i) => {
            if (i % 2 === 0) room.foodTrail.push(seg);
          });
          snake.body = [];
        });

        const alive = Object.keys(room.snakes).filter(id => room.snakes[id].alive);

        if (alive.length <= 1 && Object.keys(room.snakes).length > 1) {
          room.gameOver = true;
          room.winner = alive[0] || null;
        }

        broadcastState(io, roomCode);

      }, 150);
    });

    socket.on("leaveRoom", (roomCode) => {
      const room = rooms[roomCode];
      if (!room) return;

      socket.leave(roomCode);
      socket.roomCode = null;

      // Remove player from room if they're in it
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        delete room.snakes[socket.id];
        delete room.scores[socket.id];
      }

      broadcastState(io, roomCode);

      if (room.players.length === 0) {
        console.log("Room empty, delaying deletion:", roomCode);

        setTimeout(() => {
          if (rooms[roomCode] && rooms[roomCode].players.length === 0) {
            console.log("Deleting room after delay:", roomCode);
            clearInterval(rooms[roomCode].interval);
            delete rooms[roomCode];
          }
        }, 10000);
      }
    });

    socket.on("disconnect", () => {
      const roomCode = socket.roomCode;
      const room = rooms[roomCode];
      if (!room) return;

      delete room.snakes[socket.id];
      delete room.scores[socket.id];
      room.players = room.players.filter(p => p.id !== socket.id);

      broadcastState(io, roomCode);

      if (room.players.length === 0) {
        console.log("Room empty, delaying deletion:", roomCode);

        setTimeout(() => {
          if (rooms[roomCode] && rooms[roomCode].players.length === 0) {
            console.log("Deleting room after delay:", roomCode);
            clearInterval(rooms[roomCode].interval);
            delete rooms[roomCode];
          }
        }, 10000);
      }
    });
  });
}

module.exports = socketHandler;
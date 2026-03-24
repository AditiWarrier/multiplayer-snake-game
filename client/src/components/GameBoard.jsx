import { useEffect, useState } from "react";
import socket from "../socket";

export default function GameBoard() {

  const gridSize = 20;

  const [snakes, setSnakes] = useState({});
  const [food, setFood] = useState(null);
  const handleGameState = (state) => {
  console.log("GAME STATE RECEIVED:", state); // 🔥 ADD THIS
  setSnakes(state.snakes || {});
  setFood(state.food || null);
};

  // 🎮 Listen to game state
  useEffect(() => {

  const roomCode = new URLSearchParams(window.location.search).get("code");

  if (roomCode) {
    socket.emit("joinRoom", roomCode);   // 🔥 THIS WAS MISSING
    socket.emit("getState", roomCode);   // 🔥 THIS FIXES EMPTY DATA
  }

  const handleGameState = (state) => {
    console.log("GAME STATE:", state); // 👈 debug (keep for now)
    setSnakes(state.snakes || {});
    setFood(state.food || null);
  };

  socket.on("gameState", handleGameState);

  return () => {
    socket.off("gameState", handleGameState);
  };

}, []);

  // 🎮 Movement input
  useEffect(() => {

    const handleKey = (e) => {

      let direction = null;

      if (e.key === "ArrowUp") direction = "UP";
      if (e.key === "ArrowDown") direction = "DOWN";
      if (e.key === "ArrowLeft") direction = "LEFT";
      if (e.key === "ArrowRight") direction = "RIGHT";

      if (direction) {
        socket.emit("move", direction);
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };

  }, []);

  // 🎨 Render
  return (
    <div className="flex justify-center">

      <div
        className="grid bg-gray-200 border-2 border-gray-400"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 20px)`
        }}
      >

        {Array.from({ length: gridSize * gridSize }).map((_, index) => {

          const x = index % gridSize;
          const y = Math.floor(index / gridSize);

          let snakeColor = null;

          for (const snake of Object.values(snakes)) {
            if (
              snake.body.some(
                (segment) => segment.x === x && segment.y === y
              )
            ) {
              snakeColor = snake.color;
              break;
            }
          }

          const isFood =
            food && food.x === x && food.y === y;

          return (
            <div
              key={index}
              className={`w-5 h-5 border ${
                snakeColor
                  ? (
                      snakeColor === "green" ? "bg-green-500" :
                      snakeColor === "blue" ? "bg-blue-500" :
                      snakeColor === "red" ? "bg-red-500" :
                      snakeColor === "yellow" ? "bg-yellow-500" :
                      "bg-green-500"
                    )
                  : isFood
                  ? "bg-red-500"
                  : "bg-gray-100"
              }`}
            />
          );

        })}

      </div>

    </div>
  );
}
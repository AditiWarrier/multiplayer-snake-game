import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import GameBoard from "../components/GameBoard";
import socket from "../socket"; // 🔥 MISSING BEFORE

export default function Game() {

  const [players, setPlayers] = useState([]);

  useEffect(() => {

  const roomCode = new URLSearchParams(window.location.search).get("code");

  if (roomCode) {
    socket.emit("joinRoom", roomCode);   // 🔥 ADD THIS
    socket.emit("getState", roomCode);
  }

  const handleGameState = (state) => {

    const snakeIds = Object.keys(state.snakes || {});

    const formatted = snakeIds.map((id, index) => ({
      name: index === 0 ? "Host" : `Player ${index + 1}`,
      id
    }));

    setPlayers(formatted);
  };

  socket.on("gameState", handleGameState);

  return () => {
    socket.off("gameState", handleGameState);
  };

}, []);

  return (
    <div className="min-h-screen bg-gray-100">

      <Navbar />

      <div className="flex justify-center mt-10 gap-8 px-6">

        {/* LEFT PANEL */}
        <div className="w-60 bg-white shadow rounded-xl p-4">

          <h2 className="text-lg font-semibold mb-4">
            Players
          </h2>

          <ul className="space-y-2">
            {players.map((player, index) => (
              <li key={index} className="border p-2 rounded">
                {player.name}
              </li>
            ))}
          </ul>

        </div>

        {/* CENTER */}
        <div>
          <GameBoard />
        </div>

        {/* RIGHT PANEL */}
        <div className="w-60 bg-white shadow rounded-xl p-4">

          <h2 className="text-lg font-semibold mb-4">
            Scoreboard
          </h2>

          <ul className="space-y-2">
            {players.map((player, index) => (
              <li
                key={index}
                className="border p-2 rounded flex justify-between"
              >
                <span>{player.name}</span>
                <span>0</span>
              </li>
            ))}
          </ul>

        </div>

      </div>

    </div>
  );
}
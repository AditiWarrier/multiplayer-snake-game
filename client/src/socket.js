import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  autoConnect: true,
  transports: ["websocket"], // ensures stable connection
});

// 🔌 Connection log
socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

// 🔌 Disconnect log
socket.on("disconnect", (reason) => {
  console.log("Socket disconnected:", reason);
});

// 🧠 Helper to track room
socket.setRoomCode = (roomCode) => {
  socket.roomCode = roomCode;

  if (roomCode) {
    sessionStorage.setItem("roomCode", roomCode);
  } else {
    sessionStorage.removeItem("roomCode");
  }
};

export default socket;
# Realtime Multiplayer Snake Arena

A real-time multiplayer Snake game built using a client-server architecture. Players can create and join game rooms and participate in synchronized multiplayer sessions.

## Features

- Real-time multiplayer communication using Socket.IO
- Room creation and room-based player sessions
- Server-side game loop
- Grid-based snake movement and collision detection
- JWT-based authentication
- REST API integration
- MongoDB-backed user and session data
- Responsive React user interface

## Tech Stack

### Frontend

- React.js
- JavaScript
- Tailwind CSS

### Backend

- Node.js
- Express.js
- Socket.IO
- REST APIs
- JWT Authentication

### Database

- MongoDB
- Mongoose

## Architecture

The application follows a client-server architecture.

The React client handles the user interface and player interactions, while the Node.js and Express backend manages authentication, rooms, and application logic.

Socket.IO enables low-latency, bidirectional communication between connected players and the server. Multiplayer game state is managed through a server-side game loop to keep player sessions synchronized.

## Project Structure

```text
multiplayer-snake-game/
├── client/        # React frontend
├── server/        # Node.js and Express backend
└── README.md
```

## Running the Project Locally

### 1. Clone the Repository

```bash
git clone https://github.com/AditiWarrier/multiplayer-snake-game.git
cd multiplayer-snake-game
```

### 2. Install and Run the Frontend

```bash
cd client
npm install
npm run dev
```

### 3. Install and Run the Backend

Open another terminal and run:

```bash
cd server
npm install
npm run dev
```

### 4. Configure Environment Variables

Create a `.env` file inside the `server` directory and configure the required database and authentication environment variables.

## Key Engineering Concepts

- Real-time client-server communication
- WebSocket-based event handling
- Server-side game state management
- REST API development
- Authentication and authorization
- Database-backed session management
- Multiplayer synchronization

## Author

Aditi Sunil Warrier
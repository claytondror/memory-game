import { Server as SocketIOServer } from "socket.io";
import { Server } from "http";

// Store active game rooms and their state
const gameRooms = new Map<string, {
  players: Map<string, { id: string; name: string; score: number }>;
  cards: any[];
  flippedCards: number[];
  matchedPairs: number[];
  currentPlayer: number;
  moves: number;
}>();

export function setupWebSocket(httpServer: Server) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a game room
    socket.on("join-room", (data: { roomId: string; playerName: string }) => {
      const { roomId, playerName } = data;
      socket.join(roomId);

      // Initialize room if it doesn't exist
      if (!gameRooms.has(roomId)) {
        gameRooms.set(roomId, {
          players: new Map(),
          cards: [],
          flippedCards: [],
          matchedPairs: [],
          currentPlayer: 0,
          moves: 0,
        });
      }

      const room = gameRooms.get(roomId)!;
      room.players.set(socket.id, {
        id: socket.id,
        name: playerName,
        score: 0,
      });

      // Notify all players in the room
      io.to(roomId).emit("player-joined", {
        players: Array.from(room.players.values()),
        roomId,
      });
    });

    // Handle card flip
    socket.on("flip-card", (data: { roomId: string; cardIndex: number }) => {
      const { roomId, cardIndex } = data;
      const room = gameRooms.get(roomId);
      if (!room) return;

      // Broadcast the flip to all players in the room
      io.to(roomId).emit("card-flipped", {
        cardIndex,
        playerId: socket.id,
      });
    });

    // Handle match found
    socket.on("match-found", (data: { roomId: string; matchedIndices: number[] }) => {
      const { roomId, matchedIndices } = data;
      const room = gameRooms.get(roomId);
      if (!room) return;

      room.matchedPairs.push(...matchedIndices);
      room.moves++;

      // Broadcast the match to all players
      io.to(roomId).emit("pair-matched", {
        matchedIndices,
        playerId: socket.id,
        moves: room.moves,
      });
    });

    // Handle turn change
    socket.on("next-turn", (data: { roomId: string; nextPlayerIndex: number }) => {
      const { roomId, nextPlayerIndex } = data;
      const room = gameRooms.get(roomId);
      if (!room) return;

      room.currentPlayer = nextPlayerIndex;
      io.to(roomId).emit("turn-changed", {
        currentPlayer: nextPlayerIndex,
      });
    });

    // Handle game end
    socket.on("game-end", (data: { roomId: string; winner: string }) => {
      const { roomId, winner } = data;
      io.to(roomId).emit("game-ended", { winner });
      gameRooms.delete(roomId);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
      // Clean up rooms if player was the last one
      gameRooms.forEach((room, roomId) => {
        room.players.delete(socket.id);
        if (room.players.size === 0) {
          gameRooms.delete(roomId);
        } else {
          io.to(roomId).emit("player-left", {
            playerId: socket.id,
            remainingPlayers: Array.from(room.players.values()),
          });
        }
      });
    });
  });

  return io;
}

import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";

interface GameRoom {
  roomId: string;
  players: Map<string, WebSocket>;
  gameState: {
    flipped: number[];
    matched: number[];
    currentPlayer: number;
    moves: number;
  };
}

const rooms = new Map<string, GameRoom>();

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws: WebSocket) => {
    console.log("[WebSocket] New connection");

    ws.on("message", (data: string) => {
      try {
        const message = JSON.parse(data);
        console.log("[WebSocket] Message:", message.type);

        switch (message.type) {
          case "JOIN_ROOM":
            handleJoinRoom(ws, message, rooms);
            break;
          case "FLIP_CARD":
            handleFlipCard(ws, message, rooms);
            break;
          case "MATCH_FOUND":
            handleMatchFound(ws, message, rooms);
            break;
          case "GAME_RESET":
            handleGameReset(ws, message, rooms);
            break;
          case "LEAVE_ROOM":
            handleLeaveRoom(ws, message, rooms);
            break;
        }
      } catch (error) {
        console.error("[WebSocket] Error:", error);
      }
    });

    ws.on("close", () => {
      console.log("[WebSocket] Connection closed");
    });

    ws.on("error", (error: Error) => {
      console.error("[WebSocket] Error:", error.message);
    });
  });

  console.log("[WebSocket] Server initialized");
}

function handleJoinRoom(ws: WebSocket, message: any, rooms: Map<string, GameRoom>) {
  const { roomId, playerId } = message;
  let room = rooms.get(roomId);
  if (!room) {
    room = {
      roomId,
      players: new Map(),
      gameState: { flipped: [], matched: [], currentPlayer: 0, moves: 0 },
    };
    rooms.set(roomId, room);
  }
  room.players.set(playerId, ws);
  ws.send(JSON.stringify({
    type: "JOINED_ROOM",
    roomId,
    playerId,
    gameState: room.gameState,
    playerCount: room.players.size,
  }));
  broadcast(room, { type: "PLAYER_JOINED", playerId, playerCount: room.players.size });
}

function handleFlipCard(ws: WebSocket, message: any, rooms: Map<string, GameRoom>) {
  const { roomId, playerId, cardIndex } = message;
  const room = rooms.get(roomId);
  if (!room) return;
  if (!room.gameState.flipped.includes(cardIndex)) {
    room.gameState.flipped.push(cardIndex);
  }
  broadcast(room, { type: "CARD_FLIPPED", playerId, cardIndex, flipped: room.gameState.flipped });
}

function handleMatchFound(ws: WebSocket, message: any, rooms: Map<string, GameRoom>) {
  const { roomId, playerId, cardIndices } = message;
  const room = rooms.get(roomId);
  if (!room) return;
  room.gameState.matched.push(...cardIndices);
  room.gameState.flipped = room.gameState.flipped.filter((idx: number) => !cardIndices.includes(idx));
  room.gameState.moves++;
  broadcast(room, { type: "MATCH_CONFIRMED", playerId, cardIndices, matched: room.gameState.matched, moves: room.gameState.moves });
}

function handleGameReset(ws: WebSocket, message: any, rooms: Map<string, GameRoom>) {
  const { roomId } = message;
  const room = rooms.get(roomId);
  if (!room) return;
  room.gameState = { flipped: [], matched: [], currentPlayer: 0, moves: 0 };
  broadcast(room, { type: "GAME_RESET", gameState: room.gameState });
}

function handleLeaveRoom(ws: WebSocket, message: any, rooms: Map<string, GameRoom>) {
  const { roomId, playerId } = message;
  const room = rooms.get(roomId);
  if (!room) return;
  room.players.delete(playerId);
  if (room.players.size === 0) {
    rooms.delete(roomId);
  } else {
    broadcast(room, { type: "PLAYER_LEFT", playerId, playerCount: room.players.size });
  }
}

function broadcast(room: GameRoom, message: any) {
  const data = JSON.stringify(message);
  room.players.forEach((ws: WebSocket) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });
}

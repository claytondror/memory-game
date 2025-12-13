import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface GameSocketEvents {
  "player-joined": (data: { players: any[]; roomId: string }) => void;
  "card-flipped": (data: { cardIndex: number; playerId: string }) => void;
  "pair-matched": (data: { matchedIndices: number[]; playerId: string; moves: number }) => void;
  "turn-changed": (data: { currentPlayer: number }) => void;
  "game-ended": (data: { winner: string }) => void;
  "player-left": (data: { playerId: string; remainingPlayers: any[] }) => void;
}

export function useGameSocket(roomId: string, playerName: string, enabled: boolean = true) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    if (!enabled || !roomId) return;

    // Connect to WebSocket
    const socket = io(window.location.origin, {
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to game server");
      setIsConnected(true);
      
      // Join the room
      socket.emit("join-room", { roomId, playerName });
    });

    socket.on("player-joined", (data: { players: any[] }) => {
      setPlayers(data.players);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, playerName, enabled]);

  const flipCard = (cardIndex: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("flip-card", { roomId, cardIndex });
    }
  };

  const matchFound = (matchedIndices: number[]) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("match-found", { roomId, matchedIndices });
    }
  };

  const nextTurn = (nextPlayerIndex: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("next-turn", { roomId, nextPlayerIndex });
    }
  };

  const endGame = (winner: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("game-end", { roomId, winner });
    }
  };

  const on = <K extends keyof GameSocketEvents>(
    event: K,
    callback: GameSocketEvents[K]
  ) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback as any);
    }
  };

  const off = <K extends keyof GameSocketEvents>(event: K) => {
    if (socketRef.current) {
      socketRef.current.off(event);
    }
  };

  return {
    isConnected,
    players,
    flipCard,
    matchFound,
    nextTurn,
    endGame,
    on,
    off,
  };
}

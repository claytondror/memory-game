"use client";

import React, { createContext, useState, useEffect, useRef, ReactNode } from "react";
import { trpc } from "@/lib/trpc";

interface Player {
  id: string;
  name: string;
  score: number;
}

interface GameRoom {
  id: string;
  players: Player[];
  gameState: {
    cards: number[];
    flipped: boolean[];
    matched: boolean[];
    currentPlayer: number;
    moves: number;
  };
  status: "waiting" | "playing" | "finished";
  createdAt: number;
}

interface GameContextType {
  roomId: string | null;
  players: Player[];
  gameState: GameRoom["gameState"] | null;
  status: "waiting" | "playing" | "finished" | null;
  isOnline: boolean;
  createRoom: (creatorName?: string) => Promise<string>;
  joinRoom: (roomId: string, playerName: string) => Promise<boolean>;
  leaveRoom: () => Promise<void>;
  updateGameState: (gameState: GameRoom["gameState"]) => Promise<void>;
  flipCard: (cardIndex: number) => Promise<void>;
  matchFound: (matchedIndices: number[]) => Promise<void>;
  nextTurn: (nextPlayerIndex: number) => Promise<void>;
  endGame: (winner: string) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// BroadcastChannel for cross-tab communication
let broadcastChannel: BroadcastChannel | null = null;
try {
  broadcastChannel = new BroadcastChannel("game-rooms");
} catch (e) {
  console.warn("[LocalStorage] BroadcastChannel not available");
}

// Local storage implementation with BroadcastChannel sync
const localStorageRooms = {
  get: (roomId: string): GameRoom | null => {
    try {
      const data = localStorage.getItem(`game_room_${roomId}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  set: (roomId: string, room: GameRoom) => {
    try {
      localStorage.setItem(`game_room_${roomId}`, JSON.stringify(room));
      if (broadcastChannel) {
        broadcastChannel.postMessage({ type: "room-updated", roomId, room });
      }
    } catch {
      console.error("[LocalStorage] Failed to save room");
    }
  },
  delete: (roomId: string) => {
    try {
      localStorage.removeItem(`game_room_${roomId}`);
      if (broadcastChannel) {
        broadcastChannel.postMessage({ type: "room-deleted", roomId });
      }
    } catch {
      console.error("[LocalStorage] Failed to delete room");
    }
  },
};

export function GameProvider({ children }: { children: ReactNode }) {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<GameRoom["gameState"] | null>(null);
  const [status, setStatus] = useState<"waiting" | "playing" | "finished" | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const broadcastListenerRef = useRef<((event: MessageEvent) => void) | null>(null);

  // tRPC mutations
  const createRoomMutation = trpc.gameRooms.create.useMutation();
  const joinRoomMutation = trpc.gameRooms.join.useMutation();
  const updateStatusMutation = trpc.gameRooms.updateStatus.useMutation();

  // Listen to BroadcastChannel messages
  useEffect(() => {
    if (!broadcastChannel) return;

    const handleMessage = (event: MessageEvent) => {
      console.log("[BroadcastChannel] Received message:", event.data);
      if (event.data.type === "room-updated" && event.data.roomId === roomId) {
        const room = event.data.room as GameRoom;
        setPlayers(room.players);
        setGameState(room.gameState);
        setStatus(room.status);
      }
    };

    broadcastChannel.addEventListener("message", handleMessage);
    broadcastListenerRef.current = handleMessage;

    return () => {
      if (broadcastChannel && broadcastListenerRef.current) {
        broadcastChannel.removeEventListener("message", broadcastListenerRef.current);
      }
    };
  }, [roomId]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const createRoom = async (creatorName?: string): Promise<string> => {
    console.log("[createRoom] Starting...");
    const newRoomCode = Math.random().toString(36).substr(2, 8).toUpperCase();
    const initialPlayers = creatorName
      ? [
          {
            id: `${creatorName}-${Date.now()}`,
            name: creatorName,
            score: 0,
          },
        ]
      : [];
    const newRoom: GameRoom = {
      id: newRoomCode,
      players: initialPlayers,
      gameState: {
        cards: [],
        flipped: [],
        matched: [],
        currentPlayer: 0,
        moves: 0,
      },
      status: "waiting",
      createdAt: Date.now(),
    };

    try {
      // Try to create room on server via tRPC
      console.log("[createRoom] Creating room on server:", newRoomCode);
      await createRoomMutation.mutateAsync({ roomCode: newRoomCode });
      console.log("[createRoom] Room created on server:", newRoomCode);
      setIsOnline(true);
    } catch (error) {
      console.warn("[createRoom] Server failed, using localStorage:", error);
      localStorageRooms.set(newRoomCode, newRoom);
      setIsOnline(false);
    }

    setRoomId(newRoomCode);
    setPlayers(initialPlayers);
    // Save to localStorage as backup
    localStorageRooms.set(newRoomCode, newRoom);
    return newRoomCode;
  };

  const joinRoom = async (roomCodeToJoin: string, playerName: string): Promise<boolean> => {
    console.log("[joinRoom] Starting with roomCode:", roomCodeToJoin);
    try {
      // Try to join room on server via tRPC
      console.log("[joinRoom] Attempting to join room on server:", roomCodeToJoin);
      const result = await joinRoomMutation.mutateAsync({ roomCode: roomCodeToJoin });
      console.log("[joinRoom] Successfully joined room on server");
      
      setRoomId(roomCodeToJoin);
      setIsOnline(true);
      return true;
    } catch (error) {
      console.warn("[joinRoom] Server join failed, trying localStorage:", error);
      
      // Fallback to localStorage
      const room = localStorageRooms.get(roomCodeToJoin);
      if (room) {
        console.log("[joinRoom] Found room in localStorage");
        const newPlayer: Player = {
          id: `${playerName}-${Date.now()}`,
          name: playerName,
          score: 0,
        };
        room.players.push(newPlayer);
        localStorageRooms.set(roomCodeToJoin, room);
        
        setRoomId(roomCodeToJoin);
        setPlayers(room.players);
        setGameState(room.gameState);
        setStatus(room.status);
        setIsOnline(false);
        return true;
      } else {
        console.error("[joinRoom] Room not found: " + roomCodeToJoin);
        return false;
      }
    }
  };

  const leaveRoom = async (): Promise<void> => {
    if (!roomId) return;
    
    try {
      await updateStatusMutation.mutateAsync({
        roomCode: roomId,
        status: "abandoned",
      });
    } catch (error) {
      console.warn("[leaveRoom] Failed to update status on server:", error);
    }

    setRoomId(null);
    setPlayers([]);
    setGameState(null);
    setStatus(null);
    localStorageRooms.delete(roomId);
  };

  const updateGameState = async (newGameState: GameRoom["gameState"]): Promise<void> => {
    if (!roomId) return;

    setGameState(newGameState);
    
    // Update localStorage
    const room = localStorageRooms.get(roomId);
    if (room) {
      room.gameState = newGameState;
      localStorageRooms.set(roomId, room);
    }
  };

  const flipCard = async (cardIndex: number): Promise<void> => {
    if (!gameState) return;

    const newGameState = { ...gameState };
    newGameState.flipped[cardIndex] = !newGameState.flipped[cardIndex];
    await updateGameState(newGameState);
  };

  const matchFound = async (matchedIndices: number[]): Promise<void> => {
    if (!gameState) return;

    const newGameState = { ...gameState };
    matchedIndices.forEach((index) => {
      newGameState.matched[index] = true;
    });
    newGameState.moves++;
    await updateGameState(newGameState);
  };

  const nextTurn = async (nextPlayerIndex: number): Promise<void> => {
    if (!gameState) return;

    const newGameState = { ...gameState };
    newGameState.currentPlayer = nextPlayerIndex;
    await updateGameState(newGameState);
  };

  const endGame = async (winner: string): Promise<void> => {
    if (!roomId) return;

    try {
      await updateStatusMutation.mutateAsync({
        roomCode: roomId,
        status: "completed",
      });
    } catch (error) {
      console.warn("[endGame] Failed to update status on server:", error);
    }

    setStatus("finished");
    
    // Update localStorage
    const room = localStorageRooms.get(roomId);
    if (room) {
      room.status = "finished";
      localStorageRooms.set(roomId, room);
    }
  };

  const value: GameContextType = {
    roomId,
    players,
    gameState,
    status,
    isOnline,
    createRoom,
    joinRoom,
    leaveRoom,
    updateGameState,
    flipCard,
    matchFound,
    nextTurn,
    endGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextType {
  const context = React.useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within GameProvider");
  }
  return context;
}

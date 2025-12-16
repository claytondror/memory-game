import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, onValue, remove, update } from "firebase/database";

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

interface FirebaseGameContextType {
  roomId: string | null;
  players: Player[];
  gameState: GameRoom["gameState"] | null;
  status: "waiting" | "playing" | "finished" | null;
  createRoom: () => Promise<string>;
  joinRoom: (roomId: string, playerName: string) => Promise<boolean>;
  leaveRoom: () => Promise<void>;
  updateGameState: (gameState: GameRoom["gameState"]) => Promise<void>;
  flipCard: (cardIndex: number) => Promise<void>;
  matchFound: (matchedIndices: number[]) => Promise<void>;
  nextTurn: (nextPlayerIndex: number) => Promise<void>;
  endGame: (winner: string) => Promise<void>;
}

const FirebaseGameContext = createContext<FirebaseGameContextType | undefined>(undefined);

export function FirebaseGameProvider({ children }: { children: React.ReactNode }) {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<GameRoom["gameState"] | null>(null);
  const [status, setStatus] = useState<"waiting" | "playing" | "finished" | null>(null);

  const dbRef = useRef<any>(null);
  const unsubscribesRef = useRef<Array<() => void>>([]);
  const currentPlayerRef = useRef<Player | null>(null);

  // Inicializar Firebase
  useEffect(() => {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

    try {
      const app = initializeApp(firebaseConfig);
      dbRef.current = getDatabase(app);
      console.log("[Firebase] Initialized successfully");
    } catch (error) {
      console.error("[Firebase] Initialization error:", error);
    }
  }, []);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      unsubscribesRef.current.forEach((unsub) => unsub());
    };
  }, []);

  const createRoom = async (): Promise<string> => {
    if (!dbRef.current) throw new Error("Firebase not initialized");

    const newRoomId = `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newRoom: GameRoom = {
      id: newRoomId,
      players: [],
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
      await set(ref(dbRef.current, `rooms/${newRoomId}`), newRoom);
      console.log(`[Firebase] Room created: ${newRoomId}`);
      setRoomId(newRoomId);
      subscribeToRoom(newRoomId);
      return newRoomId;
    } catch (error) {
      console.error("[Firebase] Error creating room:", error);
      throw error;
    }
  };

  const joinRoom = async (roomIdToJoin: string, playerName: string): Promise<boolean> => {
    if (!dbRef.current) throw new Error("Firebase not initialized");

    try {
      const roomRef = ref(dbRef.current, `rooms/${roomIdToJoin}`);
      const snapshot = await get(roomRef);

      if (!snapshot.exists()) {
        console.error(`[Firebase] Room ${roomIdToJoin} does not exist`);
        return false;
      }

      const room = snapshot.val() as GameRoom;

      if (room.players.length >= 2) {
        console.error(`[Firebase] Room ${roomIdToJoin} is full`);
        return false;
      }

      const newPlayer: Player = {
        id: `${playerName}-${Date.now()}`,
        name: playerName,
        score: 0,
      };

      const updatedPlayers = [...room.players, newPlayer];
      await update(ref(dbRef.current, `rooms/${roomIdToJoin}`), {
        players: updatedPlayers,
        status: updatedPlayers.length === 2 ? "playing" : "waiting",
      });

      console.log(`[Firebase] Player ${playerName} joined room ${roomIdToJoin}`);
      currentPlayerRef.current = newPlayer;
      setRoomId(roomIdToJoin);
      subscribeToRoom(roomIdToJoin);
      return true;
    } catch (error) {
      console.error("[Firebase] Error joining room:", error);
      throw error;
    }
  };

  const subscribeToRoom = (roomIdToSubscribe: string) => {
    if (!dbRef.current) return;

    const roomRef = ref(dbRef.current, `rooms/${roomIdToSubscribe}`);

    const unsubscribe = onValue(
      roomRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const room = snapshot.val() as GameRoom;
          console.log(`[Firebase] Room updated:`, room);
          setPlayers(room.players);
          setGameState(room.gameState);
          setStatus(room.status);
        }
      },
      (error) => {
        console.error("[Firebase] Error subscribing to room:", error);
      }
    );

    unsubscribesRef.current.push(unsubscribe);
  };

  const leaveRoom = async () => {
    if (!roomId || !dbRef.current) return;

    try {
      const roomRef = ref(dbRef.current, `rooms/${roomId}`);
      const snapshot = await get(roomRef);

      if (snapshot.exists()) {
        const room = snapshot.val() as GameRoom;
        const updatedPlayers = room.players.filter(
          (p) => p.id !== currentPlayerRef.current?.id
        );

        if (updatedPlayers.length === 0) {
          // Delete room if empty
          await remove(roomRef);
          console.log(`[Firebase] Room ${roomId} deleted (empty)`);
        } else {
          // Update room with remaining players
          await update(roomRef, { players: updatedPlayers });
          console.log(`[Firebase] Player left room ${roomId}`);
        }
      }

      // Cleanup
      unsubscribesRef.current.forEach((unsub) => unsub());
      unsubscribesRef.current = [];
      setRoomId(null);
      setPlayers([]);
      setGameState(null);
      setStatus(null);
      currentPlayerRef.current = null;
    } catch (error) {
      console.error("[Firebase] Error leaving room:", error);
    }
  };

  const updateGameState = async (newGameState: GameRoom["gameState"]) => {
    if (!roomId || !dbRef.current) return;

    try {
      await update(ref(dbRef.current, `rooms/${roomId}`), {
        gameState: newGameState,
      });
      console.log(`[Firebase] Game state updated in room ${roomId}`);
    } catch (error) {
      console.error("[Firebase] Error updating game state:", error);
    }
  };

  const flipCard = async (cardIndex: number) => {
    if (!roomId || !gameState || !dbRef.current) return;

    try {
      const newGameState = { ...gameState };
      newGameState.flipped[cardIndex] = true;

      await update(ref(dbRef.current, `rooms/${roomId}`), {
        gameState: newGameState,
      });
      console.log(`[Firebase] Card ${cardIndex} flipped in room ${roomId}`);
    } catch (error) {
      console.error("[Firebase] Error flipping card:", error);
    }
  };

  const matchFound = async (matchedIndices: number[]) => {
    if (!roomId || !gameState || !dbRef.current) return;

    try {
      const newGameState = { ...gameState };
      matchedIndices.forEach((index) => {
        newGameState.matched[index] = true;
      });
      newGameState.moves += 1;

      // Update player score
      const updatedPlayers = players.map((p) =>
        p.id === currentPlayerRef.current?.id
          ? { ...p, score: p.score + 1 }
          : p
      );

      await update(ref(dbRef.current, `rooms/${roomId}`), {
        gameState: newGameState,
        players: updatedPlayers,
      });
      console.log(`[Firebase] Match found in room ${roomId}`);
    } catch (error) {
      console.error("[Firebase] Error recording match:", error);
    }
  };

  const nextTurn = async (nextPlayerIndex: number) => {
    if (!roomId || !gameState || !dbRef.current) return;

    try {
      const newGameState = { ...gameState };
      newGameState.currentPlayer = nextPlayerIndex;

      await update(ref(dbRef.current, `rooms/${roomId}`), {
        gameState: newGameState,
      });
      console.log(`[Firebase] Next turn in room ${roomId}: player ${nextPlayerIndex}`);
    } catch (error) {
      console.error("[Firebase] Error updating turn:", error);
    }
  };

  const endGame = async (winner: string) => {
    if (!roomId || !dbRef.current) return;

    try {
      await update(ref(dbRef.current, `rooms/${roomId}`), {
        status: "finished",
      });
      console.log(`[Firebase] Game ended in room ${roomId}: winner ${winner}`);
    } catch (error) {
      console.error("[Firebase] Error ending game:", error);
    }
  };

  const value: FirebaseGameContextType = {
    roomId,
    players,
    gameState,
    status,
    createRoom,
    joinRoom,
    leaveRoom,
    updateGameState,
    flipCard,
    matchFound,
    nextTurn,
    endGame,
  };

  return (
    <FirebaseGameContext.Provider value={value}>
      {children}
    </FirebaseGameContext.Provider>
  );
}

export function useFirebaseGame() {
  const context = useContext(FirebaseGameContext);
  if (context === undefined) {
    throw new Error("useFirebaseGame must be used within FirebaseGameProvider");
  }
  return context;
}

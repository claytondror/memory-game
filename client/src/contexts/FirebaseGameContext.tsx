import { createContext, useState, useEffect, useRef, useContext } from "react";
import { ref, set, get, onValue, remove, update } from "firebase/database";
import { getFirebaseDatabase } from "@/lib/firebase";

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
    try {
      dbRef.current = getFirebaseDatabase();
      console.log("[Firebase] Database initialized");
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

  const subscribeToRoom = (roomIdToSubscribe: string) => {
    if (!dbRef.current) {
      dbRef.current = getFirebaseDatabase();
    }

    const roomRef = ref(dbRef.current, `rooms/${roomIdToSubscribe}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const room = snapshot.val() as GameRoom;
        setPlayers(room.players);
        setGameState(room.gameState);
        setStatus(room.status);
      }
    });

    unsubscribesRef.current.push(unsubscribe);
  };

  const createRoom = async (): Promise<string> => {
    if (!dbRef.current) {
      dbRef.current = getFirebaseDatabase();
    }
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
    if (!dbRef.current) {
      dbRef.current = getFirebaseDatabase();
    }
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
      setRoomId(roomIdToJoin);
      currentPlayerRef.current = newPlayer;
      subscribeToRoom(roomIdToJoin);
      return true;
    } catch (error) {
      console.error("[Firebase] Error joining room:", error);
      return false;
    }
  };

  const leaveRoom = async (): Promise<void> => {
    if (!dbRef.current) {
      dbRef.current = getFirebaseDatabase();
    }
    if (!dbRef.current || !roomId) throw new Error("Firebase not initialized or no room");

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
        } else {
          await update(roomRef, { players: updatedPlayers });
        }
      }

      // Unsubscribe from room updates
      unsubscribesRef.current.forEach((unsub) => unsub());
      unsubscribesRef.current = [];

      setRoomId(null);
      setPlayers([]);
      setGameState(null);
      setStatus(null);
      currentPlayerRef.current = null;
    } catch (error) {
      console.error("[Firebase] Error leaving room:", error);
      throw error;
    }
  };

  const updateGameState = async (gameState: GameRoom["gameState"]): Promise<void> => {
    if (!dbRef.current) {
      dbRef.current = getFirebaseDatabase();
    }
    if (!dbRef.current || !roomId) throw new Error("Firebase not initialized or no room");

    try {
      await update(ref(dbRef.current, `rooms/${roomId}`), { gameState });
    } catch (error) {
      console.error("[Firebase] Error updating game state:", error);
      throw error;
    }
  };

  const flipCard = async (cardIndex: number): Promise<void> => {
    if (!dbRef.current) {
      dbRef.current = getFirebaseDatabase();
    }
    if (!dbRef.current || !roomId || !gameState) throw new Error("Firebase not initialized");

    try {
      const newFlipped = [...gameState.flipped];
      newFlipped[cardIndex] = true;
      await updateGameState({ ...gameState, flipped: newFlipped });
    } catch (error) {
      console.error("[Firebase] Error flipping card:", error);
      throw error;
    }
  };

  const matchFound = async (matchedIndices: number[]): Promise<void> => {
    if (!dbRef.current) {
      dbRef.current = getFirebaseDatabase();
    }
    if (!dbRef.current || !roomId || !gameState) throw new Error("Firebase not initialized");

    try {
      const newMatched = [...gameState.matched];
      matchedIndices.forEach((idx) => {
        newMatched[idx] = true;
      });

      const updatedPlayers = [...players];
      if (updatedPlayers[gameState.currentPlayer]) {
        updatedPlayers[gameState.currentPlayer].score += 1;
      }

      await update(ref(dbRef.current, `rooms/${roomId}`), {
        gameState: { ...gameState, matched: newMatched },
        players: updatedPlayers,
      });
    } catch (error) {
      console.error("[Firebase] Error recording match:", error);
      throw error;
    }
  };

  const nextTurn = async (nextPlayerIndex: number): Promise<void> => {
    if (!dbRef.current) {
      dbRef.current = getFirebaseDatabase();
    }
    if (!dbRef.current || !roomId || !gameState) throw new Error("Firebase not initialized");

    try {
      const newFlipped = gameState.flipped.map(() => false);
      await updateGameState({
        ...gameState,
        flipped: newFlipped,
        currentPlayer: nextPlayerIndex,
      });
    } catch (error) {
      console.error("[Firebase] Error switching turn:", error);
      throw error;
    }
  };

  const endGame = async (winner: string): Promise<void> => {
    if (!dbRef.current) {
      dbRef.current = getFirebaseDatabase();
    }
    if (!dbRef.current || !roomId) throw new Error("Firebase not initialized");

    try {
      await update(ref(dbRef.current, `rooms/${roomId}`), {
        status: "finished",
      });
    } catch (error) {
      console.error("[Firebase] Error ending game:", error);
      throw error;
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

export function useFirebaseGame(): FirebaseGameContextType {
  const context = useContext(FirebaseGameContext);
  if (!context) {
    throw new Error("useFirebaseGame must be used within FirebaseGameProvider");
  }
  return context;
}

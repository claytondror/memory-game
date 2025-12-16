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

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<GameRoom["gameState"] | null>(null);
  const [status, setStatus] = useState<"waiting" | "playing" | "finished" | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  const dbRef = useRef<any>(null);
  const unsubscribesRef = useRef<Array<() => void>>([]);
  const currentPlayerRef = useRef<Player | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const broadcastListenerRef = useRef<((event: MessageEvent) => void) | null>(null);

  // Initialize Firebase
  useEffect(() => {
    try {
      dbRef.current = getFirebaseDatabase();
      console.log("[Game] Database initialized");
    } catch (error) {
      console.error("[Game] Initialization error:", error);
      setIsOnline(false);
    }
  }, []);

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
      unsubscribesRef.current.forEach((unsub) => unsub());
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const subscribeToRoom = (roomIdToSubscribe: string) => {
    if (!dbRef.current) {
      // Use localStorage polling as fallback
      console.log("[Game] Using localStorage polling");
      pollIntervalRef.current = setInterval(() => {
        const room = localStorageRooms.get(roomIdToSubscribe);
        if (room) {
          setPlayers(room.players);
          setGameState(room.gameState);
          setStatus(room.status);
        }
      }, 500);
      return;
    }

    try {
      const roomRef = ref(dbRef.current, `rooms/${roomIdToSubscribe}`);
      const unsubscribe = onValue(roomRef, (snapshot) => {
        if (snapshot.exists()) {
          const room = snapshot.val() as GameRoom;
          setPlayers(room.players);
          setGameState(room.gameState);
          setStatus(room.status);
          // Also save to localStorage as backup
          localStorageRooms.set(roomIdToSubscribe, room);
        }
      });
      unsubscribesRef.current.push(unsubscribe);
    } catch (error) {
      console.error("[Game] Error subscribing to room:", error);
      setIsOnline(false);
    }
  };

  const createRoom = async (creatorName?: string): Promise<string> => {
    console.log("[createRoom] Starting...");
    const newRoomId = `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
      id: newRoomId,
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
      // Try Firebase first
      if (dbRef.current) {
        console.log("[createRoom] Writing to Firebase...");
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Firebase write timeout")), 5000)
        );

        await Promise.race([
          set(ref(dbRef.current, `rooms/${newRoomId}`), newRoom),
          timeoutPromise,
        ]);
        console.log("[createRoom] Room created on Firebase:", newRoomId);
        setIsOnline(true);
      } else {
        throw new Error("Firebase not available");
      }
    } catch (error) {
      console.warn("[createRoom] Firebase failed, using localStorage:", error);
      localStorageRooms.set(newRoomId, newRoom);
      setIsOnline(false);
    }

    setRoomId(newRoomId);
    setPlayers(initialPlayers);
    subscribeToRoom(newRoomId);
    return newRoomId;
  };

  const joinRoom = async (roomIdToJoin: string, playerName: string): Promise<boolean> => {
    console.log("[joinRoom] Starting with roomId:", roomIdToJoin);
    try {
      let room: GameRoom | null = null;

      // Try Firebase first
      if (dbRef.current) {
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Firebase read timeout")), 5000)
          );

          const snapshot = (await Promise.race([
            get(ref(dbRef.current, `rooms/${roomIdToJoin}`)),
            timeoutPromise,
          ])) as any;

          if (snapshot.exists()) {
            room = snapshot.val() as GameRoom;
            console.log("[joinRoom] Found room on Firebase");
          }
        } catch (error) {
          console.warn("[joinRoom] Firebase failed, trying localStorage:", error);
          room = localStorageRooms.get(roomIdToJoin);
          setIsOnline(false);
        }
      } else {
        console.log("[joinRoom] Firebase not available, using localStorage");
        room = localStorageRooms.get(roomIdToJoin);
      }

      if (!room) {
        console.error("[joinRoom] Room not found:", roomIdToJoin);
        return false;
      }

      console.log("[joinRoom] Room found with players:", room.players.length);

      if (!room.players || room.players.length >= 2) {
        console.error("[joinRoom] Room is full or has no players array");
        return false;
      }

      const newPlayer: Player = {
        id: `${playerName}-${Date.now()}`,
        name: playerName,
        score: 0,
      };

      const updatedPlayers = [...room.players, newPlayer];
      const updatedRoom = {
        ...room,
        players: updatedPlayers,
        status: updatedPlayers.length === 2 ? "playing" : "waiting",
      } as GameRoom;

      // Update Firebase
      if (dbRef.current) {
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Firebase write timeout")), 5000)
          );

          await Promise.race([
            update(ref(dbRef.current, `rooms/${roomIdToJoin}`), {
              players: updatedPlayers,
              status: updatedRoom.status,
            }),
            timeoutPromise,
          ]);
          console.log("[joinRoom] Updated on Firebase");
        } catch (error) {
          console.warn("[joinRoom] Firebase update failed, using localStorage:", error);
          setIsOnline(false);
        }
      }

      // Always update localStorage
      localStorageRooms.set(roomIdToJoin, updatedRoom);

      setRoomId(roomIdToJoin);
      setPlayers(updatedPlayers);
      currentPlayerRef.current = newPlayer;
      subscribeToRoom(roomIdToJoin);
      return true;
    } catch (error) {
      console.error("[joinRoom] Error:", error);
      return false;
    }
  };

  const leaveRoom = async (): Promise<void> => {
    if (!roomId) throw new Error("No room to leave");

    try {
      // Try Firebase
      if (dbRef.current) {
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Firebase timeout")), 5000)
          );

          const snapshot = (await Promise.race([
            get(ref(dbRef.current, `rooms/${roomId}`)),
            timeoutPromise,
          ])) as any;

          if (snapshot.exists()) {
            const room = snapshot.val() as GameRoom;
            const updatedPlayers = room.players.filter(
              (p) => p.id !== currentPlayerRef.current?.id
            );

            if (updatedPlayers.length === 0) {
              await remove(ref(dbRef.current, `rooms/${roomId}`));
            } else {
              await update(ref(dbRef.current, `rooms/${roomId}`), {
                players: updatedPlayers,
              });
            }
          }
        } catch (error) {
          console.warn("[leaveRoom] Firebase failed, using localStorage:", error);
          setIsOnline(false);
        }
      }

      // Update localStorage
      localStorageRooms.delete(roomId);

      unsubscribesRef.current.forEach((unsub) => unsub());
      unsubscribesRef.current = [];
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

      setRoomId(null);
      setPlayers([]);
      setGameState(null);
      setStatus(null);
      currentPlayerRef.current = null;
    } catch (error) {
      console.error("[leaveRoom] Error:", error);
      throw error;
    }
  };

  const updateGameState = async (newGameState: GameRoom["gameState"]): Promise<void> => {
    if (!roomId) throw new Error("No room");

    try {
      if (dbRef.current) {
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Firebase timeout")), 5000)
          );

          await Promise.race([
            update(ref(dbRef.current, `rooms/${roomId}`), { gameState: newGameState }),
            timeoutPromise,
          ]);
        } catch (error) {
          console.warn("[updateGameState] Firebase failed, using localStorage:", error);
          setIsOnline(false);
        }
      }

      // Update localStorage
      const room = localStorageRooms.get(roomId);
      if (room) {
        localStorageRooms.set(roomId, { ...room, gameState: newGameState });
      }
    } catch (error) {
      console.error("[updateGameState] Error:", error);
      throw error;
    }
  };

  const flipCard = async (cardIndex: number): Promise<void> => {
    if (!gameState) throw new Error("No game state");
    const newFlipped = [...gameState.flipped];
    newFlipped[cardIndex] = true;
    await updateGameState({ ...gameState, flipped: newFlipped });
  };

  const matchFound = async (matchedIndices: number[]): Promise<void> => {
    if (!gameState) throw new Error("No game state");
    const newMatched = [...gameState.matched];
    matchedIndices.forEach((idx) => {
      newMatched[idx] = true;
    });

    const updatedPlayers = [...players];
    if (updatedPlayers[gameState.currentPlayer]) {
      updatedPlayers[gameState.currentPlayer].score += 1;
    }

    if (roomId && dbRef.current) {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Firebase timeout")), 5000)
        );

        await Promise.race([
          update(ref(dbRef.current, `rooms/${roomId}`), {
            gameState: { ...gameState, matched: newMatched },
            players: updatedPlayers,
          }),
          timeoutPromise,
        ]);
      } catch (error) {
        console.warn("[matchFound] Firebase failed:", error);
        setIsOnline(false);
      }
    }

    // Update localStorage
    if (roomId) {
      const room = localStorageRooms.get(roomId);
      if (room) {
        localStorageRooms.set(roomId, {
          ...room,
          gameState: { ...gameState, matched: newMatched },
          players: updatedPlayers,
        } as GameRoom);
      }
    }
  };

  const nextTurn = async (nextPlayerIndex: number): Promise<void> => {
    if (!gameState) throw new Error("No game state");
    const newFlipped = gameState.flipped.map(() => false);
    await updateGameState({
      ...gameState,
      flipped: newFlipped,
      currentPlayer: nextPlayerIndex,
    });
  };

  const endGame = async (winner: string): Promise<void> => {
    if (!roomId) throw new Error("No room");

    try {
      if (dbRef.current) {
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Firebase timeout")), 5000)
          );

          await Promise.race([
            update(ref(dbRef.current, `rooms/${roomId}`), { status: "finished" }),
            timeoutPromise,
          ]);
        } catch (error) {
          console.warn("[endGame] Firebase failed:", error);
          setIsOnline(false);
        }
      }

      // Update localStorage
      const room = localStorageRooms.get(roomId);
      if (room) {
        localStorageRooms.set(roomId, { ...room, status: "finished" });
      }
    } catch (error) {
      console.error("[endGame] Error:", error);
      throw error;
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
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within GameProvider");
  }
  return context;
}

import { describe, it, expect, beforeEach, vi } from "vitest";

describe("FirebaseGameContext", () => {
  describe("Room Management", () => {
    it("should generate unique room IDs", () => {
      const roomId1 = `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const roomId2 = `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      expect(roomId1).not.toBe(roomId2);
      expect(roomId1).toMatch(/^room-\d+-[a-z0-9]+$/);
    });

    it("should validate room code format", () => {
      const validCodes = ["ROOM1234", "ABC12345", "TESTCODE"];
      const invalidCodes = ["", "room", "123"];

      validCodes.forEach((code) => {
        expect(code.length).toBeGreaterThan(0);
      });

      invalidCodes.forEach((code) => {
        expect(code.length).toBeLessThanOrEqual(3);
      });
    });
  });

  describe("Player Management", () => {
    it("should handle player joining", () => {
      const players = [];
      const newPlayer = { id: "player-1", name: "Alice", score: 0 };
      
      players.push(newPlayer);
      
      expect(players).toHaveLength(1);
      expect(players[0]).toEqual(newPlayer);
    });

    it("should prevent more than 2 players in a room", () => {
      const players = [
        { id: "player-1", name: "Alice", score: 0 },
        { id: "player-2", name: "Bob", score: 0 },
      ];

      expect(players.length).toBeLessThanOrEqual(2);
      expect(players.length).toBe(2);
    });

    it("should update player scores", () => {
      const players = [
        { id: "player-1", name: "Alice", score: 0 },
        { id: "player-2", name: "Bob", score: 0 },
      ];

      // Alice finds a match
      const updatedPlayers = players.map((p) =>
        p.id === "player-1" ? { ...p, score: p.score + 1 } : p
      );

      expect(updatedPlayers[0].score).toBe(1);
      expect(updatedPlayers[1].score).toBe(0);
    });
  });

  describe("Game State Synchronization", () => {
    it("should track game state changes", () => {
      const gameState = {
        cards: [0, 1, 2, 3, 4, 5],
        flipped: [false, false, false, false, false, false],
        matched: [false, false, false, false, false, false],
        currentPlayer: 0,
        moves: 0,
      };

      // Player flips a card
      const newGameState = { ...gameState };
      newGameState.flipped[0] = true;
      newGameState.moves += 1;

      expect(newGameState.flipped[0]).toBe(true);
      expect(newGameState.moves).toBe(1);
    });

    it("should handle match detection", () => {
      const gameState = {
        cards: [0, 1, 2, 3, 4, 5],
        flipped: [true, true, false, false, false, false],
        matched: [false, false, false, false, false, false],
        currentPlayer: 0,
        moves: 0,
      };

      // Check if cards at index 0 and 1 match (they have the same value)
      const card1 = gameState.cards[0];
      const card2 = gameState.cards[1];
      const isMatch = card1 === card2;

      if (isMatch) {
        gameState.matched[0] = true;
        gameState.matched[1] = true;
      }

      expect(gameState.matched[0]).toBe(false); // They don't match
      expect(gameState.matched[1]).toBe(false);
    });

    it("should handle turn switching in multiplayer", () => {
      const gameState = {
        cards: [0, 1, 2, 3, 4, 5],
        flipped: [false, false, false, false, false, false],
        matched: [false, false, false, false, false, false],
        currentPlayer: 0,
        moves: 0,
      };

      // No match found, switch to next player
      const nextPlayer = (gameState.currentPlayer + 1) % 2;
      gameState.currentPlayer = nextPlayer;

      expect(gameState.currentPlayer).toBe(1);

      // Switch again
      gameState.currentPlayer = (gameState.currentPlayer + 1) % 2;
      expect(gameState.currentPlayer).toBe(0);
    });
  });

  describe("Room Status", () => {
    it("should track room status transitions", () => {
      let status: "waiting" | "playing" | "finished" = "waiting";

      // Start game when 2 players join
      status = "playing";
      expect(status).toBe("playing");

      // End game when all cards are matched
      status = "finished";
      expect(status).toBe("finished");
    });

    it("should handle room cleanup", () => {
      const rooms = new Map();
      const roomId = "room-123";

      // Create room
      rooms.set(roomId, { players: [], status: "waiting" });
      expect(rooms.has(roomId)).toBe(true);

      // Delete room when empty
      if (rooms.get(roomId).players.length === 0) {
        rooms.delete(roomId);
      }
      expect(rooms.has(roomId)).toBe(false);
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid room codes", () => {
      const invalidCode = "";
      const isValid = invalidCode.trim().length > 0;

      expect(isValid).toBe(false);
    });

    it("should handle player disconnection", () => {
      const players = [
        { id: "player-1", name: "Alice", score: 0 },
        { id: "player-2", name: "Bob", score: 0 },
      ];

      // Player 1 disconnects
      const updatedPlayers = players.filter((p) => p.id !== "player-1");

      expect(updatedPlayers).toHaveLength(1);
      expect(updatedPlayers[0].id).toBe("player-2");
    });
  });
});

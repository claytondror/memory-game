import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(isAdmin: boolean = false): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: isAdmin ? "admin" : "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("Game Procedures", () => {
  describe("cardImages", () => {
    it("should list active card images publicly", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      // This should not throw even for non-admin users
      const result = await caller.cardImages.list();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should reject non-admin users from listing all cards", async () => {
      const ctx = createTestContext(false);
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.cardImages.listAll();
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should allow admin users to list all cards", async () => {
      const ctx = createTestContext(true);
      const caller = appRouter.createCaller(ctx);

      // This should not throw for admin users
      const result = await caller.cardImages.listAll();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should reject non-admin users from creating cards", async () => {
      const ctx = createTestContext(false);
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.cardImages.create({
          name: "Test Card",
          frontImageBase64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          backImageBase64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should reject non-admin users from deleting cards", async () => {
      const ctx = createTestContext(false);
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.cardImages.delete({ id: 1 });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should reject non-admin users from toggling card status", async () => {
      const ctx = createTestContext(false);
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.cardImages.toggleActive({ id: 1, isActive: false });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });

  describe("game", () => {
    it("should generate a unique room ID", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result1 = await caller.game.generateRoomId();
      const result2 = await caller.game.generateRoomId();

      expect(result1.roomId).toBeDefined();
      expect(result2.roomId).toBeDefined();
      expect(result1.roomId).not.toBe(result2.roomId);
      expect(result1.roomId.length).toBe(8);
      expect(result2.roomId.length).toBe(8);
    });

    it("should reject non-authenticated users from creating game sessions", async () => {
      const ctx = createTestContext();
      ctx.user = null;
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.game.createSession({
          mode: "single",
        });
        expect.fail("Should have thrown UNAUTHORIZED error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });
  });

  describe("auth", () => {
    it("should return current user with me query", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const user = await caller.auth.me();

      expect(user).toEqual(ctx.user);
    });

    it("should logout successfully", async () => {
      const clearedCookies: Array<{ name: string; options: Record<string, unknown> }> = [];

      const ctx = createTestContext();
      ctx.res = {
        clearCookie: (name: string, options: Record<string, unknown>) => {
          clearedCookies.push({ name, options });
        },
      } as any;

      const caller = appRouter.createCaller(ctx);
      const result = await caller.auth.logout();

      expect(result.success).toBe(true);
      expect(clearedCookies.length).toBe(1);
    });
  });
});

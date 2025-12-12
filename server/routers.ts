import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Card Images management (admin only)
  cardImages: router({
    list: publicProcedure.query(async () => {
      return db.getAllActiveCardImages();
    }),

    listAll: protectedProcedure.query(async ({ ctx }) => {
      // Only admin can see all card images
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return db.getAllCardImages();
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).max(255),
          frontImageBase64: z.string(),
          backImageBase64: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        try {
          // Upload front image
          const frontBuffer = Buffer.from(input.frontImageBase64, "base64");
          const frontKey = `cards/front-${nanoid()}.png`;
          const { url: frontUrl } = await storagePut(frontKey, frontBuffer, "image/png");

          // Upload back image
          const backBuffer = Buffer.from(input.backImageBase64, "base64");
          const backKey = `cards/back-${nanoid()}.png`;
          const { url: backUrl } = await storagePut(backKey, backBuffer, "image/png");

          // Save to database
          await db.createCardImage({
            name: input.name,
            frontImageUrl: frontUrl,
            backImageUrl: backUrl,
            isActive: true,
          });

          return { success: true };
        } catch (error) {
          console.error("Error creating card image:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        await db.deleteCardImage(input.id);
        return { success: true };
      }),

    toggleActive: protectedProcedure
      .input(z.object({ id: z.number(), isActive: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        await db.updateCardImageStatus(input.id, input.isActive);
        return { success: true };
      }),

    setPair: protectedProcedure
      .input(z.object({ id: z.number(), pairId: z.number().nullable() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        await db.updateCardImagePair(input.id, input.pairId);
        return { success: true };
      }),
  }),

  // Game management
  game: router({
    createSession: protectedProcedure
      .input(
        z.object({
          mode: z.enum(["single", "local", "online"]),
          roomId: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const result = await db.createGameSession({
          mode: input.mode,
          roomId: input.roomId || undefined,
          status: "active",
        });

        // Get the inserted ID from the result
        const gameSessionId = (result as any).insertId as number;

        // Add current user as participant
        await db.addGameParticipant({
          gameSessionId,
          userId: ctx.user.id,
          score: 0,
          pairsFound: 0,
        });

        return { gameSessionId };
      }),

    getSession: publicProcedure
      .input(z.object({ gameSessionId: z.number() }))
      .query(async ({ input }) => {
        const session = await db.getGameSession(input.gameSessionId);
        if (!session) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return session;
      }),

    getSessionByRoom: publicProcedure
      .input(z.object({ roomId: z.string() }))
      .query(async ({ input }) => {
        const session = await db.getGameSessionByRoomId(input.roomId);
        if (!session) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return session;
      }),

    addParticipant: protectedProcedure
      .input(z.object({ gameSessionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.addGameParticipant({
          gameSessionId: input.gameSessionId,
          userId: ctx.user.id,
          score: 0,
          pairsFound: 0,
        });
        return { success: true };
      }),

    getParticipants: publicProcedure
      .input(z.object({ gameSessionId: z.number() }))
      .query(async ({ input }) => {
        return db.getGameParticipants(input.gameSessionId);
      }),

    recordMove: protectedProcedure
      .input(
        z.object({
          gameSessionId: z.number(),
          firstCardIndex: z.number(),
          secondCardIndex: z.number(),
          isMatch: z.boolean(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.recordGameMove({
          gameSessionId: input.gameSessionId,
          userId: ctx.user.id,
          firstCardIndex: input.firstCardIndex,
          secondCardIndex: input.secondCardIndex,
          isMatch: input.isMatch,
        });
        return { success: true };
      }),

    updateScore: protectedProcedure
      .input(
        z.object({
          gameSessionId: z.number(),
          userId: z.number(),
          score: z.number(),
          pairsFound: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const participants = await db.getGameParticipants(input.gameSessionId);
        const participant = participants.find((p) => p.userId === input.userId);
        
        if (!participant) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        await db.updateParticipantScore(participant.id, input.score, input.pairsFound);
        return { success: true };
      }),

    completeGame: protectedProcedure
      .input(z.object({ gameSessionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.updateGameSession(input.gameSessionId, {
          status: "completed",
          completedAt: new Date(),
        });
        return { success: true };
      }),

    generateRoomId: publicProcedure.query(() => {
      return { roomId: nanoid(8) };
    }),
  }),
});

export type AppRouter = typeof appRouter;

import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb, upsertUser, getUserByOpenId } from "./db";
import { eq } from "drizzle-orm";
import { users } from "../drizzle/schema";

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

    // Register or update user with role selection
    registerOrUpdate: publicProcedure
      .input(
        z.object({
          openId: z.string(),
          name: z.string().optional(),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          role: z.enum(["traveler", "car_renter", "admin"]),
          loginMethod: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          // Upsert user with selected role
          await upsertUser({
            openId: input.openId,
            name: input.name,
            email: input.email,
            phone: input.phone,
            role: input.role,
            loginMethod: input.loginMethod || "oauth",
          });

          // Fetch and return updated user
          const user = await getUserByOpenId(input.openId);
          return {
            success: true,
            user,
          };
        } catch (error) {
          console.error("[Auth] Registration failed:", error);
          throw new Error("Failed to register user");
        }
      }),

    // Get or create user during OAuth callback
    getOrCreateUser: publicProcedure
      .input(
        z.object({
          openId: z.string(),
          name: z.string().optional(),
          email: z.string().email().optional(),
          loginMethod: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) {
            throw new Error("Database not available");
          }

          // Check if user exists
          let user = await getUserByOpenId(input.openId);

          if (!user) {
            // Create new user with default "user" role (will be updated during role selection)
            await upsertUser({
              openId: input.openId,
              name: input.name,
              email: input.email,
              loginMethod: input.loginMethod || "oauth",
              role: "user", // Default role, will be updated
            });
            user = await getUserByOpenId(input.openId);
          } else {
            // Update last signed in time
            await db
              .update(users)
              .set({ lastSignedIn: new Date() })
              .where(eq(users.openId, input.openId));
          }

          return {
            success: true,
            user,
            isNewUser: !user,
          };
        } catch (error) {
          console.error("[Auth] Get or create user failed:", error);
          throw new Error("Failed to process user");
        }
      }),

    // Update user profile
    updateProfile: protectedProcedure
      .input(
        z.object({
          name: z.string().optional(),
          bio: z.string().optional(),
          phone: z.string().optional(),
          profilePhotoUrl: z.string().optional(),
          travelPreferences: z.any().optional(),
          companyName: z.string().optional(),
          businessLicense: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const db = await getDb();
          if (!db) {
            throw new Error("Database not available");
          }

          const updateData: Record<string, any> = {};
          if (input.name !== undefined) updateData.name = input.name;
          if (input.bio !== undefined) updateData.bio = input.bio;
          if (input.phone !== undefined) updateData.phone = input.phone;
          if (input.profilePhotoUrl !== undefined) updateData.profilePhotoUrl = input.profilePhotoUrl;
          if (input.travelPreferences !== undefined) updateData.travelPreferences = input.travelPreferences;
          if (input.companyName !== undefined) updateData.companyName = input.companyName;
          if (input.businessLicense !== undefined) updateData.businessLicense = input.businessLicense;

          await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, ctx.user.id));

          return { success: true };
        } catch (error) {
          console.error("[Auth] Profile update failed:", error);
          throw new Error("Failed to update profile");
        }
      }),

    // Get user by ID
    getUserById: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) {
            throw new Error("Database not available");
          }

          const user = await db
            .select()
            .from(users)
            .where(eq(users.id, input.userId))
            .limit(1);

          return user.length > 0 ? user[0] : null;
        } catch (error) {
          console.error("[Auth] Get user failed:", error);
          return null;
        }
      }),
  }),

  // TODO: add feature routers here
});

export type AppRouter = typeof appRouter;

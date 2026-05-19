import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

describe("auth.registerOrUpdate", () => {
  it("registers a new traveler user with correct role", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.registerOrUpdate({
      openId: "test-traveler-123",
      name: "John Traveler",
      email: "john@example.com",
      phone: "+1234567890",
      role: "traveler",
      loginMethod: "oauth",
    });

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user?.role).toBe("traveler");
    expect(result.user?.email).toBe("john@example.com");
  });

  it("registers a traveler user successfully", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.registerOrUpdate({
      openId: "test-renter-456",
      name: "Jane Traveler",
      email: "jane@example.com",
      role: "traveler",
      loginMethod: "oauth",
    });

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user?.role).toBe("traveler");
    expect(result.user?.name).toBe("Jane Traveler");
  });

  it("registers a new admin user with correct role", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.registerOrUpdate({
      openId: "test-admin-789",
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      loginMethod: "oauth",
    });

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user?.role).toBe("admin");
  });

  it("updates existing user with new role", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    // First registration as traveler
    const firstResult = await caller.auth.registerOrUpdate({
      openId: "test-update-user",
      name: "Update Test",
      email: "update@example.com",
      role: "traveler",
      loginMethod: "oauth",
    });

    expect(firstResult.user?.role).toBe("traveler");

    // Update to admin
    const secondResult = await caller.auth.registerOrUpdate({
      openId: "test-update-user",
      name: "Update Test",
      email: "update@example.com",
      role: "admin",
      loginMethod: "oauth",
    });

    expect(secondResult.success).toBe(true);
    expect(secondResult.user?.role).toBe("admin");
  });

  it("handles optional phone number", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.registerOrUpdate({
      openId: "test-no-phone",
      name: "No Phone User",
      email: "nophone@example.com",
      role: "traveler",
    });

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
  });
});

describe("auth.getOrCreateUser", () => {
  it("creates a new user on first OAuth login", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.getOrCreateUser({
      openId: "oauth-new-user",
      name: "OAuth User",
      email: "oauth@example.com",
      loginMethod: "manus",
    });

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user?.openId).toBe("oauth-new-user");
    expect(result.user?.loginMethod).toBe("manus");
  });

  it("returns existing user on subsequent logins", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    // First login
    const firstResult = await caller.auth.getOrCreateUser({
      openId: "oauth-existing-user",
      name: "Existing User",
      email: "existing@example.com",
      loginMethod: "manus",
    });

    expect(firstResult.success).toBe(true);

    // Second login with same openId
    const secondResult = await caller.auth.getOrCreateUser({
      openId: "oauth-existing-user",
      name: "Existing User",
      email: "existing@example.com",
      loginMethod: "manus",
    });

    expect(secondResult.success).toBe(true);
    expect(secondResult.user?.id).toBe(firstResult.user?.id);
  });
});

describe("auth.me", () => {
  it("returns null for unauthenticated user", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();

    expect(result).toBeNull();
  });

  it("returns authenticated user data", async () => {
    const user: AuthenticatedUser = {
      id: 1,
      openId: "sample-user",
      email: "sample@example.com",
      name: "Sample User",
      phone: "+1234567890",
      loginMethod: "manus",
      role: "traveler",
      profilePhotoUrl: null,
      bio: null,
      isVerified: false,
      verificationBadge: "none",
      averageRating: "0.00",
      totalReviews: 0,
      travelPreferences: null,
      travelHistory: null,
      companyName: null,
      businessLicense: null,
      bankAccount: null,
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

    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();

    expect(result).toEqual(user);
    expect(result?.role).toBe("traveler");
  });
});

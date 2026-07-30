import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { createEmptyCard } from "ts-fsrs";

// Define the serializable card type for Convex
export const CardDataSchema = v.object({
  due: v.union(v.number(), v.string()), // timestamp in milliseconds
  stability: v.number(),
  difficulty: v.number(),
  elapsed_days: v.number(),
  scheduled_days: v.number(),
  reps: v.number(),
  lapses: v.number(),
  state: v.number(),
  last_review: v.union(v.number(), v.null()), // timestamp or null
  learning_steps: v.number(),
});

export const RootGroupSchema = v.record(v.string(), CardDataSchema);

const initialRootGroups = {};

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const doc = await ctx.db
      .query("fsrs")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!doc) {
      return {
        rootGroupsByFirstLetter: initialRootGroups,
        userId: userId,
      };
    }
    return doc;
  },
});

export const update = mutation({
  args: {
    rootGroupsByFirstLetter: RootGroupSchema,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !userId) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("fsrs")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        rootGroupsByFirstLetter: args.rootGroupsByFirstLetter,
      });
    } else {
      await ctx.db.insert("fsrs", {
        userId: userId,
        rootGroupsByFirstLetter: args.rootGroupsByFirstLetter,
      });
    }

    return { success: true };
  },
});

// Helper mutation to initialize if needed
export const initialize = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !userId) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("fsrs")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!existing) {
      await ctx.db.insert("fsrs", {
        userId: userId,
        rootGroupsByFirstLetter: initialRootGroups,
      });
    }

    return { success: true };
  },
});

import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const doc = await ctx.db
      .query("miscPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!doc) {
      return {
        lastModified: Date.now(),
        highlightedRoots: [],
        ranks: [0],
        reciter_id: "1",
        reviewOrder: "next_review ASC",
      };
    }
    return doc;
  },
});

export const update = mutation({
  args: {
    lastModified: v.optional(v.number()),
    highlightedRoots: v.optional(v.array(v.string())),
    ranks: v.optional(v.array(v.number())),
    reciter_id: v.optional(v.string()),
    reviewOrder: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const existing = await ctx.db
      .query("miscPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      const { ...updates } = args;
      await ctx.db.patch(existing._id, updates);
    } else {
      await ctx.db.insert("miscPreferences", {
        userId: userId,
        lastModified: args.lastModified ?? Date.now(),
        highlightedRoots: args.highlightedRoots ?? [],
        ranks: args.ranks ?? [0],
        reciter_id: args.reciter_id ?? "1",
        reviewOrder: args.reviewOrder ?? "next_review ASC",
      });
    }

    return { success: true };
  },
});

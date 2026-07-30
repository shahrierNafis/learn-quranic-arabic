import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const initialGoalRecords = {
  xp: { value: 0, name: "XP", goal: 1000, streak: 0 },
  verse: { value: 0, name: "Quran Verse Count", goal: 10, streak: 0 },
  word: { value: 0, name: "Frequency List Verse Count", goal: 100, streak: 0 },
};

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const doc = await ctx.db
      .query("dailyGoals")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!doc) {
      return {
        date: new Date().toISOString().split("T")[0],
        goalRecords: initialGoalRecords,
      };
    }
    return doc;
  },
});

export const update = mutation({
  args: {
    date: v.optional(v.string()),
    goalRecords: v.optional(
      v.record(
        v.string(),
        v.object({
          value: v.number(),
          name: v.string(),
          goal: v.number(),
          streak: v.number(),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const existing = await ctx.db
      .query("dailyGoals")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      const { ...updates } = args;
      await ctx.db.patch(existing._id, updates);
    } else {
      await ctx.db.insert("dailyGoals", {
        userId: userId,
        date: args.date ?? new Date().toISOString().split("T")[0],
        goalRecords: args.goalRecords ?? initialGoalRecords,
      });
    }

    return { success: true };
  },
});

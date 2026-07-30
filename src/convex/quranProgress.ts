import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const initialQuranProgress = Object.fromEntries(
  Array.from({ length: 114 }, (_, i) => i + 1).map((chapter) => [chapter.toString(), 0]),
);

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const doc = await ctx.db
      .query("quranProgress")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!doc) {
      return {
        progress: initialQuranProgress,
      };
    }
    return doc;
  },
});

export const update = mutation({
  args: {
    chapter: v.number(),
    progress: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const existing = await ctx.db
      .query("quranProgress")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    const newProgress = existing ? existing.progress : { ...initialQuranProgress };
    newProgress[args.chapter.toString()] = args.progress;

    if (existing) {
      await ctx.db.patch(existing._id, { progress: newProgress });
    } else {
      await ctx.db.insert("quranProgress", {
        userId: userId,
        progress: newProgress,
      });
    }

    return { success: true };
  },
});

export const add = mutation({
  args: {
    chapter: v.number(),
    progress: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const existing = await ctx.db
      .query("quranProgress")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    const newProgress = existing ? existing.progress : { ...initialQuranProgress };
    const current = newProgress[args.chapter.toString()] || 0;
    newProgress[args.chapter.toString()] = current + args.progress;

    if (existing) {
      await ctx.db.patch(existing._id, { progress: newProgress });
    } else {
      await ctx.db.insert("quranProgress", {
        userId: userId,
        progress: newProgress,
      });
    }

    return { success: true };
  },
});

export const reset = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const existing = await ctx.db
      .query("quranProgress")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { progress: initialQuranProgress });
    } else {
      await ctx.db.insert("quranProgress", {
        userId: userId,
        progress: initialQuranProgress,
      });
    }

    return { success: true };
  },
});

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { defaultColours } from "../stores/constants";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const doc = await ctx.db
      .query("colors")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!doc) {
      return {
        colors: defaultColours,
      };
    }
    return doc;
  },
});

export const update = mutation({
  args: {
    pos: v.string(),
    value: v.string(),
    value2: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const existing = await ctx.db
      .query("colors")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    const newColors = existing ? existing.colors : defaultColours;
    newColors[args.pos] = [args.value, args.value2];

    if (existing) {
      await ctx.db.patch(existing._id, { colors: newColors });
    } else {
      await ctx.db.insert("colors", {
        userId,
        colors: newColors,
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
      .query("colors")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { colors: defaultColours });
    } else {
      await ctx.db.insert("colors", {
        userId,
        colors: defaultColours,
      });
    }

    return { success: true };
  },
});

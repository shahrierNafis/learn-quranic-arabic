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
      .query("displayPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!doc) {
      return {
        translation_ids: ["149"],
        showTranslation: false,
        showTranslationOnHiddenWords: false,
        showTransliteration: false,
        font: "Noto_Sans_Arabic",
      };
    }
    return doc;
  },
});

export const update = mutation({
  args: {
    translation_ids: v.optional(v.array(v.string())),
    showTranslation: v.optional(v.boolean()),
    showTranslationOnHiddenWords: v.optional(v.boolean()),
    showTransliteration: v.optional(v.boolean()),
    font: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const existing = await ctx.db
      .query("displayPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      const { ...updates } = args;
      await ctx.db.patch(existing._id, updates);
    } else {
      await ctx.db.insert("displayPreferences", {
        userId: userId,
        translation_ids: args.translation_ids ?? ["149"],
        showTranslation: args.showTranslation ?? false,
        showTranslationOnHiddenWords: args.showTranslationOnHiddenWords ?? false,
        showTransliteration: args.showTransliteration ?? false,
        font: args.font ?? "Noto_Sans_Arabic",
      });
    }

    return { success: true };
  },
});

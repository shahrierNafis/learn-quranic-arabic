import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import { CardDataSchema, RootGroupSchema } from "./fsrs";

export default defineSchema({
  ...authTables,

  displayPreferences: defineTable({
    userId: v.id("users"),
    translation_ids: v.array(v.string()),
    showTranslation: v.boolean(),
    showTranslationOnHiddenWords: v.boolean(),
    showTransliteration: v.boolean(),
    font: v.string(),
  }).index("by_userId", ["userId"]),

  colors: defineTable({
    userId: v.id("users"),
    colors: v.record(v.string(), v.array(v.string())),
  }).index("by_userId", ["userId"]),

  quranProgress: defineTable({
    userId: v.id("users"),
    progress: v.record(v.string(), v.number()),
  }).index("by_userId", ["userId"]),

  miscPreferences: defineTable({
    userId: v.id("users"),
    lastModified: v.number(),
    highlightedRoots: v.array(v.string()),
    ranks: v.array(v.number()),
    reciter_id: v.string(),
    reviewOrder: v.string(),
  }).index("by_userId", ["userId"]),

  dailyGoals: defineTable({
    userId: v.id("users"),
    date: v.string(),
    goalRecords: v.record(
      v.string(),
      v.object({
        value: v.number(),
        name: v.string(),
        goal: v.number(),
        streak: v.number(),
      }),
    ),
  }).index("by_userId", ["userId"]),

  fsrs: defineTable({
    userId: v.id("users"),
    rootGroupsByFirstLetter: RootGroupSchema,
  }).index("by_userId", ["userId"]),
});

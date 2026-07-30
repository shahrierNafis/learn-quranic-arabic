/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as colors from "../colors.js";
import type * as dailyGoals from "../dailyGoals.js";
import type * as displayPreferences from "../displayPreferences.js";
import type * as fsrs from "../fsrs.js";
import type * as http from "../http.js";
import type * as miscPreferences from "../miscPreferences.js";
import type * as quranProgress from "../quranProgress.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  colors: typeof colors;
  dailyGoals: typeof dailyGoals;
  displayPreferences: typeof displayPreferences;
  fsrs: typeof fsrs;
  http: typeof http;
  miscPreferences: typeof miscPreferences;
  quranProgress: typeof quranProgress;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

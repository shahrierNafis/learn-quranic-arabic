import GitHub from "@auth/core/providers/github";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { MutationCtx } from "./_generated/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
    Password({
      profile(params) {
        const email = typeof params.email === "string" ? params.email.toLowerCase() : "";
        return {
          email,
          name: typeof params.name === "string" ? params.name : "",
          image: "",
        };
      },
    }),
  ],
  signIn: {
    maxFailedAttempsPerHour: 20,
  },
  callbacks: {
    async createOrUpdateUser(ctx: MutationCtx, args) {
      // args.existingUserId is set if Convex Auth already matched
      // this provider+account to a user (e.g. signing in again with GitHub)
      if (args.existingUserId) {
        return args.existingUserId;
      }

      const email = typeof args.profile.email === "string" ? args.profile.email.toLowerCase() : undefined;

      if (email) {
        // Look for an existing user with this email, regardless of
        // which provider originally created them
        const existingUser = await ctx.db
          .query("users")
          .withIndex("email", (q) => q.eq("email", email))
          .unique();

        if (existingUser) {
          return existingUser._id;
        }
      }

      // No match found — create a brand new user
      return ctx.db.insert("users", {
        email,
        name: typeof args.profile.name === "string" ? args.profile.name : "",
        image: "",
      });
    },
  },
});

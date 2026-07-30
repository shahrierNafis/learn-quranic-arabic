"use client";

import { useState, type FormEvent } from "react";
import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import Link from "@/components/ui/Link";
import { Button } from "@/components/ui/button";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function ConvexAuthPanel() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);

    if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
      setStatus("Convex is not configured for this app yet.");
      setSubmitting(false);
      return;
    }

    try {
      const flow = mode === "signUp" ? "signUp" : "signIn";
      const result = await signIn("password", { flow, email, password });
      if (!result.signingIn) {
        setStatus(mode === "signUp" ? "Account ready. You can sign in now." : "Signed in successfully.");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to complete password authentication.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGithubSignIn() {
    setSubmitting(true);
    setStatus("Redirecting to GitHub...");

    if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
      setStatus("Convex is not configured for this app yet.");
      setSubmitting(false);
      return;
    }

    try {
      await signIn("github", { redirectTo: window.location.origin });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to start GitHub sign-in.");
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-sm rounded-lg border border-border/70 bg-background/80 p-4 shadow-sm backdrop-blur">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Sign in to continue</h2>
            <p className="text-sm text-muted-foreground">Use GitHub OAuth or an email/password account.</p>
          </div>
        </div>

        <div className="mb-3 flex gap-2">
          <Button
            variant={mode === "signIn" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setMode("signIn")}
          >
            Sign in
          </Button>
          <Button
            variant={mode === "signUp" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setMode("signUp")}
          >
            Sign up
          </Button>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
            required
            minLength={8}
          />
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Working..." : mode === "signUp" ? "Create account" : "Sign in with password"}
          </Button>
        </form>

        <div className="my-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          <span>or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Button variant="outline" className="w-full" onClick={handleGithubSignIn} disabled={submitting}>
          Continue with GitHub
        </Button>

        {status ? <p className="mt-3 text-sm text-muted-foreground">{status}</p> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 items-center min-w-xs">
      <Link
        className="mx-auto animate-background-move block rounded-md bg-linear-to-r from-green-300 via-white to-green-500 bg-size-[400%_400%] p-px [animation-duration:3s] w-full"
        href="/activeRead"
      >
        <Button className="w-full" variant="outline">
          <div>Start</div>
        </Button>
      </Link>
      <Button variant="outline" className="w-full" onClick={() => void signOut()}>
        Logout
      </Button>
    </div>
  );
}

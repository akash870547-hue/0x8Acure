import { createContext, useCallback, useContext, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabaseClient } from "../lib/supabaseClient";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
};
const SupabaseAuthContext = createContext<AuthContextValue | null>(null);

export function SupabaseSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    if (!supabaseClient) return;
    let alive = true;
    void supabaseClient.auth.getSession().then(({ data, error }) => {
      if (error) console.error("Could not restore Supabase session.", error);
      if (alive) setSession(data.session);
    });
    const { data } = supabaseClient.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => { alive = false; data.subscription.unsubscribe(); };
  }, []);

  const requireClient = useCallback(() => {
    if (!supabaseClient) throw new Error("Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable Supabase authentication.");
    return supabaseClient;
  }, []);
  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await requireClient().auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
  }, [requireClient]);
  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const consentAt = new Date().toISOString();
    const localPart = email.trim().split("@")[0].toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 30) || "user";
    const username = `${localPart}-${crypto.randomUUID().slice(0, 8)}`;
    const { error } = await requireClient().auth.signUp({
      email: email.trim(), password,
      options: {
        data: { full_name: fullName.trim(), name: fullName.trim() || username, username, consent_at: consentAt, privacy_version: "2026-09-30" },
        emailRedirectTo: window.location.href
      }
    });
    if (error) throw error;
  }, [requireClient]);
  const sendMagicLink = useCallback(async (email: string) => {
    const { error } = await requireClient().auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.href, shouldCreateUser: false }
    });
    if (error) throw error;
  }, [requireClient]);
  const signInWithGithub = useCallback(async () => {
    sessionStorage.setItem("0x8acure-oauth-consent-at", new Date().toISOString());
    const { error } = await requireClient().auth.signInWithOAuth({ provider: "github", options: { redirectTo: window.location.href } });
    if (error) throw error;
  }, [requireClient]);
  const signOut = useCallback(async () => {
    const { error } = await requireClient().auth.signOut();
    if (error) throw error;
  }, [requireClient]);
  const value = useMemo(() => ({
    session, user: session?.user || null, configured: Boolean(supabaseClient),
    signIn, signUp, sendMagicLink, signInWithGithub, signOut
  }), [session, signIn, signUp, sendMagicLink, signInWithGithub, signOut]);
  return <SupabaseAuthContext.Provider value={value}>{children}</SupabaseAuthContext.Provider>;
}

export function useSupabaseSession() {
  const value = useContext(SupabaseAuthContext);
  if (!value) throw new Error("useSupabaseSession must be used inside SupabaseSessionProvider.");
  return value;
}

export function SupabaseAuthControls() {
  const auth = useSupabaseSession();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [consented, setConsented] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<void>) {
    setError(""); setMessage(""); setBusy(true);
    try { await action(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Supabase authentication failed."); }
    finally { setBusy(false); }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    await run(async () => {
      if (mode === "signup") {
        if (!consented) throw new Error("Accept the privacy notice to create an account.");
        await auth.signUp(email, password, fullName);
        setMessage("Account created. Confirm your email using the link we sent before signing in.");
        setMode("signin");
      } else await auth.signIn(email, password);
    });
  }

  return <div className="supabase-auth-control">
    <button type="button" className="ap-auth-trigger" onClick={() => { setOpen(true); setError(""); setMessage(""); }}>
      {auth.user ? auth.user.email || "Account" : "Sign in"}
    </button>
    {open && <div className="ap-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section className="ap-modal ap-session-modal" role="dialog" aria-modal="true" aria-labelledby="session-title">
        <button className="ap-modal-close" aria-label="Close sign in" onClick={() => setOpen(false)}>×</button>
        {auth.user ? <>
          <span className="ap-kicker">SUPABASE ACCOUNT</span><h2 id="session-title">Signed in</h2>
          <p>{auth.user.email}</p>
          <div className="ap-modal-actions"><button className="ap-button secondary" onClick={() => setOpen(false)}>Close</button><button className="ap-button primary" disabled={busy} onClick={() => void run(auth.signOut)}>Sign out</button></div>
        </> : <>
          <span className="ap-kicker">0X8ACURE ACCOUNT</span><h2 id="session-title">{mode === "signup" ? "Create your account" : "Sign in to your account"}</h2>
          <p>Supabase Auth provides a shared session for the learning platform and Cyber Lab.</p>
          <form className="ap-auth-form" onSubmit={submit}>
            {mode === "signup" && <label>Full name<input autoComplete="name" required value={fullName} onChange={(event) => setFullName(event.target.value)}/></label>}
            <label>Email<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)}/></label>
            {mode === "signin" && <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)}/></label>}
            {mode === "signup" && <label className="ap-consent"><input type="checkbox" checked={consented} onChange={(event) => setConsented(event.target.checked)}/><span>I have read the privacy notice and agree to create an account.</span></label>}
            <button className="ap-button primary" type="submit" disabled={busy}>{mode === "signup" ? "Create account" : "Sign in with password"}</button>
          </form>
          {mode === "signin" && <div className="ap-session-actions">
            <button className="ap-link-button" disabled={busy || !email} onClick={() => void run(async () => { await auth.sendMagicLink(email); setMessage("Magic link sent. Check your email to finish signing in."); })}>Send magic link</button>
            <label className="ap-consent ap-oauth-consent"><input type="checkbox" checked={consented} onChange={(event) => setConsented(event.target.checked)}/><span>I have read the privacy notice and agree to sign in.</span></label>
            <button className="ap-button secondary" disabled={busy || !consented} onClick={() => void run(auth.signInWithGithub)}>Continue with GitHub</button>
          </div>}
          <button className="ap-link-button" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setMessage(""); }}>{mode === "signin" ? "Create an account" : "Already registered? Sign in"}</button>
          {error && <p className="ap-feedback error" role="alert">{error}</p>}
          {message && <p className="ap-feedback notice" role="status">{message}</p>}
        </>}
      </section>
    </div>}
  </div>;
}

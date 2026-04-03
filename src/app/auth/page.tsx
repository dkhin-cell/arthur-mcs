"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName || email.split("@")[0] } },
      });
      if (error) { setError(error.message); setLoading(false); return; }
      router.push("/");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
      router.push("/");
    }
    setLoading(false);
  }

  const accent = "#1B9C85";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', system-ui, sans-serif", background: "#F4F6F8", padding: 24 }}>
      <svg width="48" height="48" viewBox="0 0 200 200" style={{ marginBottom: 20 }}>
        <polygon points="100,10 178,55 178,145 100,190 22,145 22,55" fill="none" stroke="#1B4F72" strokeWidth="12" />
        <polygon points="100,40 155,70 155,130 100,160 45,130 45,70" fill="none" stroke="#E67E22" strokeWidth="10" />
      </svg>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1B2631", margin: "0 0 4px" }}>Arthur MCS</h1>
      <p style={{ fontSize: 14, color: "#5D6D7E", margin: "0 0 28px" }}>
        {mode === "login" ? "Welcome back." : "Create your account."}
      </p>
      <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 16, padding: 28, width: "100%", maxWidth: 380, border: "1px solid #E8EAED", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        {mode === "signup" && (
          <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Display name" style={{ width: "100%", padding: "12px 14px", fontSize: 14, borderRadius: 10, border: "1.5px solid #E8EAED", marginBottom: 10, boxSizing: "border-box", fontFamily: "inherit", outline: "none" }} />
        )}
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email" required style={{ width: "100%", padding: "12px 14px", fontSize: 14, borderRadius: 10, border: "1.5px solid #E8EAED", marginBottom: 10, boxSizing: "border-box", fontFamily: "inherit", outline: "none" }} />
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password (min 6 chars)" required minLength={6} style={{ width: "100%", padding: "12px 14px", fontSize: 14, borderRadius: 10, border: "1.5px solid #E8EAED", marginBottom: 16, boxSizing: "border-box", fontFamily: "inherit", outline: "none" }} />
        {error && <p style={{ color: "#E74C3C", fontSize: 13, margin: "0 0 12px" }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ width: "100%", padding: "12px", fontSize: 14, fontWeight: 700, borderRadius: 10, border: "none", background: accent, color: "#fff", cursor: loading ? "wait" : "pointer", fontFamily: "inherit", opacity: loading ? 0.7 : 1 }}>
          {loading ? "..." : mode === "login" ? "Log In" : "Sign Up"}
        </button>
        <p style={{ textAlign: "center", fontSize: 13, color: "#5D6D7E", marginTop: 16 }}>
          {mode === "login" ? "No account? " : "Already have one? "}
          <span onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }} style={{ color: accent, fontWeight: 600, cursor: "pointer" }}>
            {mode === "login" ? "Sign up" : "Log in"}
          </span>
        </p>
      </form>
      <p style={{ fontSize: 11, color: "#95A5A6", marginTop: 24 }}>© 2026 Arthur · Mission Control System</p>
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin/devis");
    } else {
      setError("Mot de passe incorrect.");
    }

    setIsLoading(false);
  };

  return (
    <div
      className={cn("flex flex-col gap-6", className)}
      {...props}
      style={{ fontFamily: "'Georgia', serif" }}
    >
      <div className="text-center mb-2">
        <div style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 56, height: 56, borderRadius: "50%", background: "#F5C400",
          marginBottom: 12, boxShadow: "0 4px 16px rgba(245,196,0,0.35)",
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L3 6v6c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V6L12 2z" fill="#1a1a1a"/>
            <path d="M9 12l2 2 4-4" stroke="#F5C400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", letterSpacing: "-0.03em", margin: 0 }}>
          ProDératisation
        </h1>
        <p style={{ fontSize: 13, color: "#888", marginTop: 4, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Espace administration
        </p>
      </div>

      <div style={{
        background: "#fff", border: "1.5px solid #F5C400", borderRadius: 16,
        padding: "32px 28px", boxShadow: "0 8px 32px rgba(245,196,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
      }}>
        <form onSubmit={handleLogin}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Label htmlFor="password" style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>
                Mot de passe admin
              </Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ border: "1.5px solid #e5e5e5", borderRadius: 8, padding: "10px 14px", fontSize: 14 }}
                onFocus={(e) => (e.target.style.borderColor = "#F5C400")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e5e5")}
              />
            </div>

            {error && (
              <p style={{
                fontSize: 13, color: "#c0392b", background: "#fdf2f2",
                border: "1px solid #f5c6cb", borderRadius: 6, padding: "8px 12px", margin: 0,
              }}>
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              style={{
                background: "#F5C400", color: "#1a1a1a", fontWeight: 700,
                fontSize: 14, border: "none", borderRadius: 8, padding: "12px",
                cursor: isLoading ? "not-allowed" : "pointer",
                boxShadow: "0 2px 8px rgba(245,196,0,0.3)",
              }}
            >
              {isLoading ? "Connexion en cours…" : "Se connecter"}
            </Button>
          </div>
        </form>
      </div>

      <p style={{ textAlign: "center", fontSize: 12, color: "#bbb", margin: 0 }}>
        Accès réservé — ProDératisation © 2026
      </p>
    </div>
  );
}

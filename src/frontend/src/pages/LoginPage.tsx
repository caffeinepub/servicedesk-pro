import { AlertCircle, Lock, Mail, Wrench } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useStore } from "../store";

export default function LoginPage() {
  const { login, navigate } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    const ok = await login(email, password);
    if (!ok) setError("Invalid credentials or account not approved.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-gray-950 via-slate-900 to-teal-950">
      {/* Decorative background orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-72 h-72 rounded-full bg-teal-600/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 rounded-full bg-emerald-700/15 blur-3xl pointer-events-none" />
      <div className="absolute top-[40%] right-[15%] w-48 h-48 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo & branding */}
        <div className="text-center mb-8">
          <div className="relative inline-flex">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-teal-900/50">
              <Wrench className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-slate-900 shadow" />
          </div>
          <h1 className="text-2xl font-bold text-white mt-4 tracking-tight">
            ServiceDesk Pro
          </h1>
          <p className="text-teal-400/80 text-sm mt-1 font-medium tracking-wide">
            Powering Service Excellence
          </p>
        </div>

        <Card className="shadow-2xl border border-teal-900/30 bg-white/[0.97] backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Sign in to access your service dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div
                  className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-100 px-3 py-2.5 rounded-lg text-sm"
                  data-ocid="login.error_state"
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-9 focus-visible:ring-teal-500"
                    data-ocid="login.input"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-9 focus-visible:ring-teal-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold h-11 shadow-md shadow-teal-900/30 transition-all duration-200"
                disabled={loading}
                data-ocid="login.primary_button"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-5 pt-4 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("register")}
                  className="text-teal-600 hover:text-teal-700 font-medium hover:underline transition-colors"
                  data-ocid="login.link"
                >
                  Request Access
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-slate-600 text-xs mt-6">
          Service Centre Management &mdash; Secure Access
        </p>
      </div>
    </div>
  );
}

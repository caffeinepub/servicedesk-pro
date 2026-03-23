import { Lock, Mail, Phone, Shield, User, Wrench } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useStore } from "../store";

export default function RegisterPage() {
  const { registerUser, navigate, setRejectionReason } = useStore();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "backend_user" as "supervisor" | "backend_user",
  });

  const [phoneError, setPhoneError] = useState("");

  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone.trim() || !/^[0-9]{10}$/.test(form.phone.trim())) {
      setPhoneError("Mobile number must be exactly 10 digits");
      return;
    }
    setPhoneError("");
    setSubmitError("");
    const result = await registerUser(form);
    if (result.message === "pending") {
      navigate("register-pending");
      return;
    }
    if (result.message === "approved") {
      navigate("register-approved");
      return;
    }
    if (result.message === "rejected") {
      setRejectionReason(result.reason || "");
      navigate("register-rejected");
      return;
    }
    if (!result.success) {
      if (result.message === "phone_exists") {
        setSubmitError("This mobile number is already registered.");
      } else {
        setSubmitError("Registration failed. Please try again.");
      }
      return;
    }
    // New successful registration -> go to pending page
    navigate("register-pending");
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
              Request Access
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Fill in your details. Admin will review and approve your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Your full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="pl-9 focus-visible:ring-teal-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    required
                    className="pl-9 focus-visible:ring-teal-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Phone
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="10-digit mobile number"
                    value={form.phone}
                    onChange={(e) => {
                      setForm({ ...form, phone: e.target.value });
                      setPhoneError("");
                    }}
                    required
                    className={`pl-9 focus-visible:ring-teal-500${phoneError ? " border-red-500" : ""}`}
                  />
                </div>
                {phoneError && (
                  <p className="text-xs text-red-500 mt-1">{phoneError}</p>
                )}
                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {submitError}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Role
                </Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
                  <Select
                    value={form.role}
                    onValueChange={(v: "supervisor" | "backend_user") =>
                      setForm({ ...form, role: v })
                    }
                  >
                    <SelectTrigger className="pl-9 focus:ring-teal-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="backend_user">Backend User</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Choose a strong password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    required
                    className="pl-9 focus-visible:ring-teal-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold h-11 mt-2 shadow-md shadow-teal-900/30 transition-all duration-200"
              >
                Submit Access Request
              </Button>
            </form>

            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => navigate("login")}
                className="text-sm text-teal-600 hover:text-teal-700 hover:underline font-medium transition-colors"
              >
                ← Back to Login
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

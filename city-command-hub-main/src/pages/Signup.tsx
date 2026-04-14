import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { LayoutDashboard, Mail, Lock, Eye, EyeOff, User, Phone, ChevronDown } from "lucide-react";

const departments = [
  { value: "infrastructure", label: "Infrastructure" },
  { value: "utilities", label: "Utilities" },
  { value: "transport", label: "Transport" },
  { value: "public_safety", label: "Public Safety" },
  { value: "environment", label: "Environment" },
  { value: "citizen", label: "Citizen (General Public)" },
];

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("citizen");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    // Update profile with phone and department
    if (data.user) {
      await supabase.from("profiles").update({ phone, department }).eq("user_id", data.user.id);

      // If department role (not citizen), request that role
      if (department !== "citizen") {
        await supabase.from("user_roles").upsert({
          user_id: data.user.id,
          role: department as any,
        });
      }
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
            <Mail className="h-6 w-6 text-success" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">Check your email</h2>
          <p className="text-sm text-muted-foreground mb-6">We've sent a confirmation link to <span className="text-foreground font-medium">{email}</span></p>
          <Link to="/login" className="text-sm text-primary hover:underline">Back to login</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-8"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">City Command</h1>
            <p className="text-xs text-muted-foreground">Create your account</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Full Name</label>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2.5 focus-within:ring-1 focus-within:ring-primary">
              <User className="h-4 w-4 text-muted-foreground" />
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2.5 focus-within:ring-1 focus-within:ring-primary">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@city.gov" required className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone</label>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2.5 focus-within:ring-1 focus-within:ring-primary">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 890" className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Department / Role</label>
            <div className="relative">
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full appearance-none rounded-lg border border-border bg-muted px-3 py-2.5 pr-8 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
              >
                {departments.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Password</label>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2.5 focus-within:ring-1 focus-within:ring-primary">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="text-muted-foreground hover:text-foreground">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}

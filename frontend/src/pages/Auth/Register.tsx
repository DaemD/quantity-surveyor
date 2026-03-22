import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HardHat, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    company_name: "",
    registration_number: "",
    address: "",
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        company_name: form.company_name,
        registration_number: form.registration_number || undefined,
        address: form.address || undefined,
      });
      navigate("/");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg ?? "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-xl shadow-blue-900/40 mb-4">
            <HardHat className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">QS Ai</h1>
          <p className="text-slate-400 text-sm mt-1">Create your account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>Set up your company profile to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg bg-red-900/30 border border-red-700 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Personal Details</p>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={form.name} onChange={set("name")} placeholder="John Smith" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={form.email} onChange={set("email")} placeholder="you@company.com" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" value={form.password} onChange={set("password")} placeholder="Min. 8 characters" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input id="confirmPassword" type="password" value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="Repeat password" required />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Company Details</p>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="company_name">Company Name <span className="text-red-400">*</span></Label>
                    <Input id="company_name" value={form.company_name} onChange={set("company_name")} placeholder="Acme Construction Ltd" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="registration_number">Company Registration Number <span className="text-slate-500">(optional)</span></Label>
                    <Input id="registration_number" value={form.registration_number} onChange={set("registration_number")} placeholder="e.g. 12345678" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="address">Registered Address <span className="text-slate-500">(optional)</span></Label>
                    <Input id="address" value={form.address} onChange={set("address")} placeholder="123 Builder Street, London" />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Create Account
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                Sign in here
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

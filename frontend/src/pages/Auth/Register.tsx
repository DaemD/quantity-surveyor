import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HardHat, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const LABOUR_MODELS = [
  { value: "direct_labour", label: "Direct Labour" },
  { value: "subcontract_heavy", label: "Subcontract Heavy" },
  { value: "mixed", label: "Mixed" },
];

const GROWTH_GOALS = [
  { value: "0_10", label: "0–10%" },
  { value: "10_20", label: "10–20%" },
  { value: "20_30", label: "20–30%" },
  { value: "30_50", label: "30–50%" },
  { value: "50_plus", label: "50%+" },
];

const CONSTRAINTS = [
  { value: "cashflow", label: "Cashflow" },
  { value: "labour", label: "Labour" },
  { value: "winning_work", label: "Winning Work" },
  { value: "pricing", label: "Pricing" },
  { value: "management_time", label: "Management Time" },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 mt-1">{children}</p>
  );
}

function SelectField({ id, label, value, onChange, options, required }: {
  id: string; label: string; value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}{required && <span className="text-red-400 ml-1">*</span>}</Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-10 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        required={required}
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

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
    primary_trade: "",
    phone: "",
    registration_number: "",
    address: "",
    avg_contract_size: "",
    target_margin: "",
    monthly_fixed_costs: "",
    labour_model: "",
    cash_reserves: "",
    years_trading: "",
    growth_goal: "",
    main_constraint: "",
  });

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const setSelect = (key: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [key]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        company_name: form.company_name,
        registration_number: form.registration_number || undefined,
        address: form.address || undefined,
        primary_trade: form.primary_trade || undefined,
        phone: form.phone || undefined,
        avg_contract_size: form.avg_contract_size ? parseFloat(form.avg_contract_size) : undefined,
        target_margin: form.target_margin ? parseFloat(form.target_margin) : undefined,
        monthly_fixed_costs: form.monthly_fixed_costs ? parseFloat(form.monthly_fixed_costs) : undefined,
        labour_model: form.labour_model || undefined,
        cash_reserves: form.cash_reserves ? parseFloat(form.cash_reserves) : undefined,
        years_trading: form.years_trading ? parseFloat(form.years_trading) : undefined,
        growth_goal: form.growth_goal || undefined,
        main_constraint: form.main_constraint || undefined,
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
      <div className="w-full max-w-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-xl shadow-blue-900/40 mb-4">
            <HardHat className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">QS Ai</h1>
          <p className="text-slate-400 text-sm mt-1">Register your business once. We use this to assess every deal.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Company Registration</CardTitle>
            <CardDescription>Your company profile powers the fit analysis on every assessment.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-lg bg-red-900/30 border border-red-700 px-4 py-3 text-sm text-red-300">{error}</div>
              )}

              {/* Personal */}
              <div>
                <SectionTitle>Your Details</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full Name <span className="text-red-400">*</span></Label>
                    <Input id="name" value={form.name} onChange={set("name")} placeholder="John Smith" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email Address <span className="text-red-400">*</span></Label>
                    <Input id="email" type="email" value={form.email} onChange={set("email")} placeholder="you@company.com" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password">Password <span className="text-red-400">*</span></Label>
                    <Input id="password" type="password" value={form.password} onChange={set("password")} placeholder="Min. 8 characters" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword">Confirm Password <span className="text-red-400">*</span></Label>
                    <Input id="confirmPassword" type="password" value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="Repeat password" required />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Company */}
              <div>
                <SectionTitle>Company Details</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="company_name">Company Name <span className="text-red-400">*</span></Label>
                    <Input id="company_name" value={form.company_name} onChange={set("company_name")} placeholder="Acme Construction Ltd" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="primary_trade">Primary Trade <span className="text-red-400">*</span></Label>
                    <Input id="primary_trade" value={form.primary_trade} onChange={set("primary_trade")} placeholder="e.g. Groundworks, Electrical, Fit-out" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone <span className="text-red-400">*</span></Label>
                    <Input id="phone" value={form.phone} onChange={set("phone")} placeholder="07700 900000" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="years_trading">Years Trading <span className="text-red-400">*</span></Label>
                    <Input id="years_trading" type="number" min="0" step="0.5" value={form.years_trading} onChange={set("years_trading")} placeholder="e.g. 5" required />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="registration_number">Company Registration Number</Label>
                    <Input id="registration_number" value={form.registration_number} onChange={set("registration_number")} placeholder="e.g. 12345678 (optional)" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="address">Registered Address</Label>
                    <Input id="address" value={form.address} onChange={set("address")} placeholder="123 Builder Street, Manchester (optional)" />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Business Profile */}
              <div>
                <SectionTitle>Business Profile — used in every deal assessment</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="avg_contract_size">Average Contract Size <span className="text-red-400">*</span></Label>
                    <div className="flex">
                      <span className="flex items-center rounded-l-lg border border-r-0 border-slate-600 bg-slate-800 px-3 text-sm text-slate-400">£</span>
                      <Input id="avg_contract_size" type="number" min="0" value={form.avg_contract_size} onChange={set("avg_contract_size")} placeholder="50000" className="rounded-l-none" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="target_margin">Target Profit Margin <span className="text-red-400">*</span></Label>
                    <div className="flex">
                      <Input id="target_margin" type="number" min="0" max="100" step="0.1" value={form.target_margin} onChange={set("target_margin")} placeholder="15" className="rounded-r-none" required />
                      <span className="flex items-center rounded-r-lg border border-l-0 border-slate-600 bg-slate-800 px-3 text-sm text-slate-400">%</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="monthly_fixed_costs">Monthly Fixed Costs (Overheads) <span className="text-red-400">*</span></Label>
                    <div className="flex">
                      <span className="flex items-center rounded-l-lg border border-r-0 border-slate-600 bg-slate-800 px-3 text-sm text-slate-400">£</span>
                      <Input id="monthly_fixed_costs" type="number" min="0" value={form.monthly_fixed_costs} onChange={set("monthly_fixed_costs")} placeholder="10000" className="rounded-l-none" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cash_reserves">Available Cash Reserves <span className="text-red-400">*</span></Label>
                    <div className="flex">
                      <span className="flex items-center rounded-l-lg border border-r-0 border-slate-600 bg-slate-800 px-3 text-sm text-slate-400">£</span>
                      <Input id="cash_reserves" type="number" min="0" value={form.cash_reserves} onChange={set("cash_reserves")} placeholder="30000" className="rounded-l-none" required />
                    </div>
                  </div>
                  <SelectField
                    id="labour_model" label="Labour Model"
                    value={form.labour_model} onChange={setSelect("labour_model")}
                    options={LABOUR_MODELS} required
                  />
                  <SelectField
                    id="growth_goal" label="Company Growth Goal (Next 12 Months)"
                    value={form.growth_goal} onChange={setSelect("growth_goal")}
                    options={GROWTH_GOALS} required
                  />
                  <div className="sm:col-span-2">
                    <SelectField
                      id="main_constraint" label="Main Business Constraint Right Now"
                      value={form.main_constraint} onChange={setSelect("main_constraint")}
                      options={CONSTRAINTS} required
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Create Account
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in here</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

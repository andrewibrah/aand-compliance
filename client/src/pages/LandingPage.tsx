import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="text-2xl font-bold text-amber-500">AAND</div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => setLocation("/login")}>
              Login
            </Button>
            <Button onClick={() => setLocation("/signup")} className="bg-amber-600 hover:bg-amber-700">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl">
          <h1 className="mb-6 text-5xl font-bold text-white">
            FTC Safeguards Compliance Made Simple
          </h1>
          <p className="mb-8 text-xl text-slate-300">
            Guide your dealership through all 9 FTC Safeguards Rule elements, generate compliance documents, and track your progress.
          </p>
          <Button
            onClick={() => setLocation("/signup")}
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 text-lg"
          >
            Start Free Assessment
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="mb-12 text-3xl font-bold text-white">Why AAND?</h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
            <h3 className="mb-3 text-lg font-semibold text-amber-500">9-Section Wizard</h3>
            <p className="text-slate-300">Complete all FTC Safeguards Rule elements step-by-step with expert guidance.</p>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
            <h3 className="mb-3 text-lg font-semibold text-amber-500">Auto-Generated Documents</h3>
            <p className="text-slate-300">Get WISP and board-level compliance reports populated with your dealership data.</p>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
            <h3 className="mb-3 text-lg font-semibold text-amber-500">Compliance Scoring</h3>
            <p className="text-slate-300">See your compliance gaps and prioritized recommendations for remediation.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="mb-12 text-3xl font-bold text-white">Simple Pricing</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-8">
            <h3 className="mb-2 text-2xl font-bold text-white">Free</h3>
            <p className="mb-6 text-slate-300">Gap assessment and scoring</p>
            <Button variant="outline" className="w-full">
              Get Started
            </Button>
          </div>
          <div className="rounded-lg border-2 border-amber-600 bg-slate-800/50 p-8">
            <h3 className="mb-2 text-2xl font-bold text-white">Core</h3>
            <p className="mb-2 text-3xl font-bold text-amber-500">$199<span className="text-lg text-slate-400">/month</span></p>
            <p className="mb-6 text-slate-300">Full WISP + board report PDFs, dashboard, email reminders</p>
            <Button className="w-full bg-amber-600 hover:bg-amber-700">
              Upgrade to Core
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900 py-8">
        <div className="container mx-auto px-4 text-center text-slate-400">
          <p>&copy; 2026 AAND. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

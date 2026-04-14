import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { useState } from "react";

export default function Signup() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dealershipName, setDealershipName] = useState("");

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement signup logic with tRPC
    console.log("Signup:", { email, password, dealershipName });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <div className="p-8">
          <h1 className="mb-2 text-2xl font-bold text-white">Create Account</h1>
          <p className="mb-6 text-slate-400">Start your compliance journey</p>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="dealership" className="text-slate-200">
                Dealership Name
              </Label>
              <Input
                id="dealership"
                type="text"
                placeholder="Your dealership name"
                value={dealershipName}
                onChange={(e) => setDealershipName(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-slate-200">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@dealership.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-slate-200">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700">
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-slate-400">
            Already have an account?{" "}
            <button
              onClick={() => setLocation("/login")}
              className="text-amber-500 hover:text-amber-400 font-semibold"
            >
              Login
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
}

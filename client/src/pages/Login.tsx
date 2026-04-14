import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, loading } = useAuth();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, loading, setLocation]);

  const handleLogin = () => {
    // Redirect to Manus OAuth login
    window.location.href = getLoginUrl();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <div className="p-8">
          <h1 className="mb-2 text-2xl font-bold text-white">Login</h1>
          <p className="mb-6 text-slate-400">Access your compliance dashboard</p>

          <div className="space-y-4">
            <Button
              onClick={handleLogin}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-6"
            >
              Login with Manus
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800 text-slate-400">or</span>
              </div>
            </div>

            <p className="text-center text-slate-300 text-sm">
              Don't have an account?{" "}
              <button
                onClick={() => setLocation("/signup")}
                className="text-amber-500 hover:text-amber-400 font-semibold"
              >
                Sign up here
              </button>
            </p>
          </div>

          <div className="mt-8 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
            <h3 className="font-semibold text-white mb-2 text-sm">Need help?</h3>
            <p className="text-sm text-slate-300">
              If you don't have an account yet, click "Sign up here" to create one. We use secure Manus OAuth authentication.
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            By logging in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </Card>
    </div>
  );
}

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Wizard from "./pages/Wizard";
import Documents from "./pages/Documents";
import Pricing from "./pages/Pricing";

function Router() {
  // Public routes: landing, signup, login
  // Protected routes: dashboard, wizard, documents
  return (
    <Switch>
      <Route path={"/"} component={LandingPage} />
      <Route path={"/signup"} component={Signup} />
      <Route path={"/login"} component={Login} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/wizard"} component={Wizard} />
      <Route path={"/documents"} component={Documents} />
      <Route path={"/pricing"} component={Pricing} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - Dark theme with professional styling for regulatory/compliance product
// - Navy/slate background with gold accents for trust and expertise

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

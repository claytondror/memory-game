import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import GameMode from "./pages/GameMode";
import SinglePlayerGame from "./pages/SinglePlayerGame";
import LocalMultiplayerGame from "./pages/LocalMultiplayerGame";
import OnlineMultiplayerGame from "./pages/OnlineMultiplayerGame";
import AdminPanel from "./pages/AdminPanel";
import GameHistory from "./pages/GameHistory";
import { GameProvider } from "@/contexts/GameContextWithFallback";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={GameMode} />
      <Route path={"/game/single"} component={SinglePlayerGame} />
      <Route path={"/game/local"} component={LocalMultiplayerGame} />
      <Route path={"/game/online"} component={OnlineMultiplayerGame} />
      <Route path={"/history"} component={GameHistory} />
      <Route path={"/admin"} component={AdminPanel} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <GameProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </GameProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

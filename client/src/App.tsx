import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Groups from "@/pages/groups";
import GroupDetails from "@/pages/group-details";
import CreateGroup from "@/pages/create-group";
import Payments from "@/pages/payments";
import History from "@/pages/history";
import Profile from "@/pages/profile";
import Landing from "@/pages/landing";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  return (
    <Switch>
      {isLoading ? (
        <Route path="/" component={() => (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        )} />
      ) : !isAuthenticated && !user ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/groups" component={Groups} />
          <Route path="/groups/:id" component={GroupDetails} />
          <Route path="/create-group" component={CreateGroup} />
          <Route path="/payments" component={Payments} />
          <Route path="/history" component={History} />
          <Route path="/profile" component={Profile} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

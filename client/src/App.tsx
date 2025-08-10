import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Groups from "@/pages/groups";
import GroupDetails from "@/pages/group-details";
import CreateGroup from "@/pages/create-group";
import Payments from "@/pages/payments";
import History from "@/pages/history";
import Profile from "@/pages/profile";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/groups" component={Groups} />
      <Route path="/groups/:id" component={GroupDetails} />
      <Route path="/create-group" component={CreateGroup} />
      <Route path="/payments" component={Payments} />
      <Route path="/history" component={History} />
      <Route path="/profile" component={Profile} />
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

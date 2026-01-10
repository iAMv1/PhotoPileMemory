import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";

import ContributorDashboard from "@/pages/ContributorDashboard";
import RecipientAccess from "@/pages/RecipientAccess";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/contribute" component={ContributorDashboard} />
      <Route path="/access" component={RecipientAccess} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}

export default App;

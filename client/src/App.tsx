import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/LandingPage";
import EventDashboard from "@/pages/EventDashboard";
import ContributorDashboard from "@/pages/ContributorDashboard";
import RecipientAccess from "@/pages/RecipientAccess";

function Router() {
  return (
    <Switch>
      {/* Functionality: New Multi-User Routes */}
      <Route path="/" component={LandingPage} />
      <Route path="/dashboard/:slug" component={EventDashboard} />

      <Route path="/e/:slug/contribute" component={ContributorDashboard} />
      <Route path="/e/:slug/access" component={RecipientAccess} />

      {/* Legacy/Demo Routes - Redirect to a demo event or generic */}
      {/* <Route path="/access" component={RecipientAccess} /> */}
      {/* <Route path="/contribute" component={ContributorDashboard} /> */}

      {/* For compatibility with existing flow if needed during transition */}
      <Route path="/demo/access" component={() => {
        // Force "demo" slug context? Or just render the component?
        // For now, let's just make /access work as before but slightly broken without eventId?
        // Or redirect to a demo setup.
        window.location.href = "/e/demo/access";
        return null;
      }} />

      {/* Fallback */}
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

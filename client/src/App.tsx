import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Repository from "@/pages/repository";
import Issue from "@/pages/issue";
import Login from "@/pages/admin/login";
import { SiteHeader } from "@/components/site-header";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/repository" component={Repository} />
        <Route path="/issue/:id" component={Issue} />
        <Route path="/admin/login" component={Login} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;

import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import { isAuthenticated } from "./lib/auth";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import RecordingDetails from "@/pages/RecordingDetails";
import NotFound from "@/pages/not-found";

function AuthenticatedRoute({ component: Component, ...rest }: { component: React.ComponentType }) {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    if (!isAuthenticated()) {
      setLocation('/login');
    }
  }, [setLocation]);
  
  if (!isAuthenticated()) {
    return null;
  }
  
  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard">
        <AuthenticatedRoute component={Dashboard} />
      </Route>
      <Route path="/recording/:id">
        <AuthenticatedRoute component={RecordingDetails} />
      </Route>
      <Route path="/">
        {/* Redirect to dashboard if authenticated, otherwise to login */}
        {isAuthenticated() ? <Dashboard /> : <Login />}
      </Route>
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
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

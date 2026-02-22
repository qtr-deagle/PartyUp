import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SafetyProvider } from "./contexts/SafetyContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Match from "./pages/Match";
import Chat from "./pages/Chat";
import MapPage from "./pages/MapPage";
import Profile from "./pages/Profile";
import MyTrips from "./pages/MyTrips";
import TrustedCircle from "./pages/TrustedCircle";
import Carpooling from "./pages/Carpooling";
import PostRide from "./pages/PostRide";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminTrips from "./pages/AdminTrips";
import AdminReports from "./pages/AdminReports";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }

  return <Component />;
}

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/" component={() => <ProtectedRoute component={Home} />} />
      <Route path="/match" component={() => <ProtectedRoute component={Match} />} />
      <Route path="/find-buddy" component={() => <ProtectedRoute component={Match} />} />
      <Route path="/chat" component={() => <ProtectedRoute component={Chat} />} />
      <Route path="/map" component={() => <ProtectedRoute component={MapPage} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
      <Route path="/my-trips" component={() => <ProtectedRoute component={MyTrips} />} />
      <Route path="/trusted-circle" component={() => <ProtectedRoute component={TrustedCircle} />} />
      <Route path="/carpooling" component={() => <ProtectedRoute component={Carpooling} />} />
      <Route path="/post-ride" component={() => <ProtectedRoute component={PostRide} />} />
      <Route path="/admin" component={() => <AdminRoute component={AdminDashboard} />} />
      <Route path="/admin/dashboard" component={() => <AdminRoute component={AdminDashboard} />} />
      <Route path="/admin/users" component={() => <AdminRoute component={AdminUsers} />} />
      <Route path="/admin/trips" component={() => <AdminRoute component={AdminTrips} />} />
      <Route path="/admin/reports" component={() => <AdminRoute component={AdminReports} />} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        switchable={true}
      >
        <AuthProvider>
          <SafetyProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </SafetyProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

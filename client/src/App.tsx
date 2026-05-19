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
import PublicLanding from "./pages/PublicLanding";
import Discovery from "./pages/Discovery";
import Chat from "./pages/Chat";
import MapPage from "./pages/MapPage";
import Profile from "./pages/Profile";
import MyTrips from "./pages/MyTrips";
import TrustedCircle from "./pages/TrustedCircle";
import Carpooling from "./pages/Carpooling";
import PostRide from "./pages/PostRide";
import Settings from "./pages/Settings";
import Cars from "./pages/Cars";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminTrips from "./pages/AdminTrips";
import AdminReports from "./pages/AdminReports";
import AdminStaff from "./pages/AdminStaff";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminSettings from "./pages/AdminSettings";
import AdminAudit from "./pages/AdminAudit";
import StaffDashboard from "./pages/StaffDashboard";
import StaffDisputes from "./pages/StaffDisputes";
import StaffVehicles from "./pages/StaffVehicles";
import StaffTrips from "./pages/StaffTrips";
import EditProfile from "./pages/EditProfile";
import Tours from "./pages/Tours";
import ToursCreate from "./pages/ToursCreate";
import ToursManage from "./pages/ToursManage";
import AdminFeedback from "./pages/AdminFeedback";
import AdminPaymentIssues from "./pages/AdminPaymentIssues";
import MyParticipatedTours from "./pages/MyParticipatedTours";
import Trips from "./pages/Trips";

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

function StaffRoute({ component: Component }: { component: React.ComponentType }) {
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/landing" component={PublicLanding} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/" component={() => <ProtectedRoute component={Home} />} />
      <Route path="/discovery" component={() => <ProtectedRoute component={Discovery} />} />
      <Route path="/find-buddy" component={() => <ProtectedRoute component={Discovery} />} />
      <Route path="/chat" component={() => <ProtectedRoute component={Chat} />} />
      <Route path="/map" component={() => <ProtectedRoute component={MapPage} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
      <Route path="/profile/edit" component={() => <ProtectedRoute component={EditProfile} />} />
      <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />
      <Route path="/tours" component={() => <ProtectedRoute component={Tours} />} />
      <Route path="/tours/create" component={() => <ProtectedRoute component={ToursCreate} />} />
      <Route path="/tours/manage" component={() => <ProtectedRoute component={ToursManage} />} />
      <Route path="/my-trips" component={() => <ProtectedRoute component={MyTrips} />} />
      <Route path="/my-participated-tours" component={() => <ProtectedRoute component={MyParticipatedTours} />} />
      <Route path="/trips/:id" component={() => <ProtectedRoute component={Trips} />} />
      <Route path="/trusted-circle" component={() => <ProtectedRoute component={TrustedCircle} />} />
      <Route path="/carpooling" component={() => <ProtectedRoute component={Carpooling} />} />
      <Route path="/post-ride" component={() => <ProtectedRoute component={PostRide} />} />
      <Route path="/cars" component={() => <ProtectedRoute component={Cars} />} />
      <Route path="/admin" component={() => <AdminRoute component={AdminDashboard} />} />
      <Route path="/admin/dashboard" component={() => <AdminRoute component={AdminDashboard} />} />
      <Route path="/admin/staff" component={() => <AdminRoute component={AdminStaff} />} />
      <Route path="/admin/analytics" component={() => <AdminRoute component={AdminAnalytics} />} />
      <Route path="/admin/users" component={() => <AdminRoute component={AdminUsers} />} />
      <Route path="/admin/trips" component={() => <AdminRoute component={AdminTrips} />} />
      <Route path="/admin/reports" component={() => <AdminRoute component={AdminReports} />} />
      <Route path="/admin/audit" component={() => <AdminRoute component={AdminAudit} />} />
      <Route path="/admin/settings" component={() => <AdminRoute component={AdminSettings} />} />
      <Route path="/admin/feedback" component={() => <AdminRoute component={AdminFeedback} />} />
      <Route path="/admin/payment-issues" component={() => <AdminRoute component={AdminPaymentIssues} />} />
      <Route path="/staff" component={() => <StaffRoute component={StaffDashboard} />} />
      <Route path="/staff/dashboard" component={() => <StaffRoute component={StaffDashboard} />} />
      <Route path="/staff/disputes" component={() => <StaffRoute component={StaffDisputes} />} />
      <Route path="/staff/vehicles" component={() => <StaffRoute component={StaffVehicles} />} />
      <Route path="/staff/trips" component={() => <StaffRoute component={StaffTrips} />} />
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

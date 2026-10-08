import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Redirect, Route, Switch } from "wouter";
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
import AdminSos from "./pages/AdminSos";
import AdminSupport from "./pages/AdminSupport";
import AdminStaff from "./pages/AdminStaff";
import AdminTeam from "./pages/AdminTeam";
import AdminGuilds from "./pages/AdminGuilds";
import AdminSettings from "./pages/AdminSettings";
import AdminAudit from "./pages/AdminAudit";
import StaffVehicles from "./pages/StaffVehicles";
import EditProfile from "./pages/EditProfile";
import Tours from "./pages/Tours";
import ToursCreate from "./pages/ToursCreate";
import ToursManage from "./pages/ToursManage";
import AdminFeedback from "./pages/AdminFeedback";
import AdminPaymentManagement from "./pages/AdminPaymentManagement";
import AdminPairingHistory from "./pages/AdminPairingHistory";
import MyParticipatedTours from "./pages/MyParticipatedTours";
import Trips from "./pages/Trips";
import TransactionHistory from "./pages/TransactionHistory";
import AdminIDVerificationReview from "./pages/AdminIDVerificationReview";
import MobileOnlyNotice from "./pages/MobileOnlyNotice";
import AccountSettings from "./pages/AccountSettings";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

// The traveler dashboard (Home, Discovery, Chat, Map, Profile, Tours,
// Carpooling, etc.) lives in the PartyUp mobile app, not this website --
// this codebase is admin tooling only (Guild Leaders work in the app too). These routes stay defined
// (rather than deleted) so the mobile-parity page components don't need to
// be ripped out, but ProtectedRoute always shows a static notice instead of
// ever rendering them, regardless of auth state.
function ProtectedRoute({ component: _Component }: { component: React.ComponentType }) {
  return <MobileOnlyNotice />;
}

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    window.location.href = '/login';
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/landing" component={PublicLanding} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
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
      <Route path="/transactions" component={() => <ProtectedRoute component={TransactionHistory} />} />
      <Route path="/trips/:id" component={() => <ProtectedRoute component={Trips} />} />
      <Route path="/trusted-circle" component={() => <ProtectedRoute component={TrustedCircle} />} />
      <Route path="/carpooling" component={() => <ProtectedRoute component={Carpooling} />} />
      <Route path="/post-ride" component={() => <ProtectedRoute component={PostRide} />} />
      <Route path="/cars" component={() => <ProtectedRoute component={Cars} />} />
      <Route path="/admin" component={() => <AdminRoute component={AdminDashboard} />} />
      <Route path="/admin/dashboard" component={() => <AdminRoute component={AdminDashboard} />} />
      <Route path="/admin/verification" component={() => <AdminRoute component={AdminIDVerificationReview} />} />
      <Route path="/admin/staff" component={() => <AdminRoute component={AdminStaff} />} />
      <Route path="/admin/team" component={() => <AdminRoute component={AdminTeam} />} />
      <Route path="/admin/guilds" component={() => <AdminRoute component={AdminGuilds} />} />
      <Route path="/admin/vehicles" component={() => <AdminRoute component={StaffVehicles} />} />
      {/* The Guild Leader (ex-staff) console was retired; old bookmarks land on the admin dashboard. */}
      <Route path="/staff">{() => <Redirect to="/admin/dashboard" />}</Route>
      <Route path="/staff/*">{() => <Redirect to="/admin/dashboard" />}</Route>
      <Route path="/admin/analytics">{() => <Redirect to="/admin/dashboard" />}</Route>
      <Route path="/admin/users" component={() => <AdminRoute component={AdminUsers} />} />
      <Route path="/admin/trips" component={() => <AdminRoute component={AdminTrips} />} />
      <Route path="/admin/sos" component={() => <AdminRoute component={AdminSos} />} />
      {/* Reports live in the Support inbox now (every report is a ticket). */}
      <Route path="/admin/reports">{() => <Redirect to="/admin/support?view=reports" />}</Route>
      <Route path="/admin/support" component={() => <AdminRoute component={AdminSupport} />} />
      <Route path="/admin/audit" component={() => <AdminRoute component={AdminAudit} />} />
      <Route path="/admin/settings" component={() => <AdminRoute component={AdminSettings} />} />
      <Route path="/admin/account" component={() => <AdminRoute component={AccountSettings} />} />
      <Route path="/admin/feedback" component={() => <AdminRoute component={AdminFeedback} />} />
      <Route path="/admin/payment-issues" component={() => <AdminRoute component={AdminPaymentManagement} />} />
      <Route path="/admin/payments" component={() => <AdminRoute component={AdminPaymentManagement} />} />
      <Route path="/admin/pairing" component={() => <AdminRoute component={AdminPairingHistory} />} />
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

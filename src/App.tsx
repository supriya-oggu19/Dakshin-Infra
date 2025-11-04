import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Agents from "./pages/Agents";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import MyUnits from "./pages/MyUnits";
import SipTracker from "./pages/sipTracker";
import Agreements from "./pages/Agreements";
import PurchaseFlow from "./pages/PurchaseFlow";
import NotFound from "./pages/NotFound";
import InvestmentSchemes from "./pages/InvestmentSchemes";
import React from "react";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import PaymentResult from "./pages/PaymentResult";

const queryClient = new QueryClient();

// Error Boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="text-muted-foreground mb-4">
              Please check the console for details or try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Protected Route
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

// ✅ AppLayout: Show footer only on home page
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <>
      {children}
      {isHome && <Footer />} {/* Footer only on home */}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <ErrorBoundary>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route
                path="/"
                element={
                  <AppLayout>
                    <Index />
                  </AppLayout>
                }
              />
              <Route
                path="/projects"
                element={
                  <AppLayout>
                    <Projects />
                  </AppLayout>
                }
              />
              <Route
                path="/projects/: id"
                element={
                  <AppLayout>
                    <ProjectDetail />
                  </AppLayout>
                }
              />
              <Route
                path="/about"
                element={
                  <AppLayout>
                    <About />
                  </AppLayout>
                }
              />
              <Route
                path="/contact"
                element={
                  <AppLayout>
                    <Contact />
                  </AppLayout>
                }
              />
              <Route
                path="/agents"
                element={
                  <AppLayout>
                    <Agents />
                  </AppLayout>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/investment-schemes/:id"
                element={
                  <AppLayout>
                    <InvestmentSchemes />
                  </AppLayout>
                }
              />
              <Route
                path="/faq"
                element={
                  <AppLayout>
                    <FAQ />
                  </AppLayout>
                }
              />
              <Route path="/payment-result" element={<PaymentResult />} />

              {/* Protected Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Profile />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/purchase/:id"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <PurchaseFlow />
                    </AppLayout>
                  </ProtectedRoute>
                }
                path="/purchase/:id/:step?"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <PurchaseFlow />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-units"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <MyUnits />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sip"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <SipTracker />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agreements"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Agreements />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* 404 */}
              <Route
                path="*"
                element={
                  <AppLayout>
                    <NotFound />
                  </AppLayout>
                }
              />
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

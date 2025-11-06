import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/ramya constructions logo.png";
import {
  Menu,
  X,
  Home,
  Building2,
  Users,
  Phone,
  Info,
  LogIn,
  LogOut,
  User,
  FileText,
  TrendingUp,
  ChevronDown,
  Briefcase
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const publicNavItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Projects", href: "/projects", icon: Building2 },
    { name: "About", href: "/about", icon: Info },
    { name: "Agents", href: "/agents", icon: Users },
    { name: "Contact", href: "/contact", icon: Phone },
  ];

  const portfolioItems = [
    { name: "My Units", href: "/my-units", icon: Building2 },
    { name: "Investment Tracker", href: "/sip", icon: TrendingUp },
    { name: "Agreements", href: "/agreements", icon: FileText },
  ];

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    setIsPortfolioOpen(false);
  };

  const handlePortfolioItemClick = () => {
    setIsPortfolioOpen(false);
    setIsMenuOpen(false);
  };

  const isPortfolioActive = portfolioItems.some(item => location.pathname === item.href);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 nav-professional">
      <div className="container-professional">
        <div className="flex items-center h-20 gap-4">
          {/* Logo - Left Side */}
          <Link to="/" className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
            <img
              src={logo}
              alt="Ramya Constructions logo"
              className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-xl shadow-lg object-contain bg-white"
            />

            <span className="text-base md:text-xl lg:text-2xl font-bold text-foreground whitespace-nowrap">
              Ramya <span className="text-gold-elegant">Constructions</span>
            </span>
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center">
            {publicNavItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                      ? "nav-item-active"
                      : "nav-item-professional"
                    }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.name}
                </Link>
              );
            })}

            {/* Portfolio Dropdown - Only show when authenticated */}
            {isAuthenticated && (
              <div
                className="relative"
                onMouseEnter={() => setIsPortfolioOpen(true)}
                onMouseLeave={() => setIsPortfolioOpen(false)}
              >
                <button
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isPortfolioActive
                      ? "nav-item-active"
                      : "nav-item-professional"
                    }`}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Portfolio
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${isPortfolioOpen ? 'rotate-180' : ''
                    }`} />
                </button>

                {/* Dropdown Menu */}
                <div
                  className={`absolute top-full left-0 w-48 bg-white rounded-lg shadow-lg border border-border transition-all duration-200 ${isPortfolioOpen
                      ? 'opacity-100 visible translate-y-0'
                      : 'opacity-0 invisible -translate-y-2'
                    }`}
                  style={{
                    marginTop: '0.25rem',
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <div className="py-2">
                    {portfolioItems.map((item) => {
                      const isActive = location.pathname === item.href;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setIsPortfolioOpen(false)}
                          className={`flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 ${isActive
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                        >
                          <Icon className="w-4 h-4 mr-3" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Auth Section - Right Side */}
          <div className="hidden lg:flex items-center space-x-3 flex-shrink-0">
            {isAuthenticated ? (
              <>
                <div className="flex items-center px-3 py-2 bg-muted rounded-lg">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    Welcome, <span className="text-primary">{user?.username}</span>
                  </span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button className="btn-gold">
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden ml-auto">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border bg-white/95 backdrop-blur-md">
            <div className="px-4 py-6 space-y-2">
              {publicNavItems.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {item.name}
                  </Link>
                );
              })}

              {/* Mobile Portfolio Section */}
              {isAuthenticated && (
                <div>
                  <button
                    onClick={() => setIsPortfolioOpen(!isPortfolioOpen)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isPortfolioActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                  >
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-3" />
                      Portfolio
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isPortfolioOpen ? 'rotate-180' : ''
                      }`} />
                  </button>

                  {isPortfolioOpen && (
                    <div className="ml-6 mt-2 space-y-1">
                      {portfolioItems.map((item) => {
                        const isActive = location.pathname === item.href;
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={handlePortfolioItemClick}
                            className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                              }`}
                          >
                            <Icon className="w-4 h-4 mr-3" />
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Auth */}
              <div className="border-t border-border pt-4 mt-4">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center px-4 py-3 bg-muted rounded-lg mb-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        Welcome, <span className="text-primary">{user?.username}</span>
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-200"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center w-full"
                  >
                    <Button className="btn-gold w-full">
                      <LogIn className="w-4 h-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/image.png";
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-blue-50/95 backdrop-blur-md border-b border-blue-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center h-20 gap-4">
          {/* Logo - Left Side */}
          <Link 
            to="/" 
            className="flex items-center flex-shrink-0 transition-transform duration-300 hover:scale-105"
          >
            <img
              src={logo}
              alt="Dakshin Infra logo"
              className="h-14 w-auto md:h-16 lg:h-18 object-contain bg-transparent"
              style={{ backgroundColor: 'transparent' }}
            />
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
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25 transform -translate-y-0.5"
                      :  "text-gray-800 hover:text-blue-700 hover:bg-blue-100 border border-transparent hover:border-blue-300"
                  }`}
                >
                  <Icon className={`w-4 h-4 mr-2 transition-colors duration-300 ${
                    isActive ? "text-white" : "text-gray-400"
                  }`} />
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
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    isPortfolioActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25 transform -translate-y-0.5"
                      : "text-gray-800 hover:text-blue-700 hover:bg-blue-100 border border-transparent hover:border-blue-300"
                  }`}
                >
                  <Briefcase className={`w-4 h-4 mr-2 transition-colors duration-300 ${
                    isPortfolioActive ? "text-white" : "text-gray-400"
                  }`} />
                  Portfolio
                  <ChevronDown className={`w-4 h-4 ml-1 transition-all duration-300 ${
                    isPortfolioOpen ? 'rotate-180 text-blue-400' : 'text-gray-500'
                  }`} />
                </button>

                {/* Dropdown Menu */}
                <div
                  className={`absolute top-full left-0 w-56 bg-gray-900 rounded-xl shadow-2xl border border-gray-800 transition-all duration-300 ${
                    isPortfolioOpen
                      ? 'opacity-100 visible translate-y-0 scale-100'
                      : 'opacity-0 invisible -translate-y-4 scale-95'
                  }`}
                  style={{
                    marginTop: '0.5rem',
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
                          className={`flex items-center px-4 py-3 text-sm font-medium transition-all duration-300 mx-2 rounded-lg ${
                            isActive
                              ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                              : "text-gray-300 hover:text-white hover:bg-gray-800 border border-transparent"
                          }`}
                        >
                          <Icon className={`w-4 h-4 mr-3 transition-colors duration-300 ${
                            isActive ? "text-white" : "text-gray-400"
                          }`} />
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
<div className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm">                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3 shadow-md">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray">
                    Welcome, <span className="text-blue-700">{user?.username}</span>
                  </span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="border-blue-600 text-blue-400 hover:text-white hover:border-blue-700 hover:bg-blue-600 font-semibold transition-all duration-300 shadow-sm"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-0.5 border-0 px-6">
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
              className="p-3 rounded-xl bg-gray-800 border border-blue-700 text-gray-300 hover:text-white hover:border-blue-500 hover:bg-gray-700 transition-all duration-300 shadow-sm"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-800 bg-black/95 backdrop-blur-md animate-slide-in-up">
            <div className="px-4 py-6 space-y-2">
              {publicNavItems.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center px-4 py-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                        : "text-gray-300 hover:text-white hover:bg-gray-800 border border-transparent"
                    }`}
                  >
                    <Icon className={`w-4 h-4 mr-3 transition-colors duration-300 ${
                      isActive ? "text-white" : "text-gray-400"
                    }`} />
                    {item.name}
                  </Link>
                );
              })}

              {/* Mobile Portfolio Section */}
              {isAuthenticated && (
                <div>
                  <button
                    onClick={() => setIsPortfolioOpen(!isPortfolioOpen)}
                    className={`w-full flex items-center justify-between px-4 py-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      isPortfolioActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                        : "text-gray-300 hover:text-white hover:bg-gray-800 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-3" />
                      Portfolio
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-all duration-300 ${
                      isPortfolioOpen ? 'rotate-180 text-blue-400' : 'text-gray-500'
                    }`} />
                  </button>

                  {isPortfolioOpen && (
                    <div className="ml-4 mt-2 space-y-1 border-l-2 border-blue-800 pl-4">
                      {portfolioItems.map((item) => {
                        const isActive = location.pathname === item.href;
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={handlePortfolioItemClick}
                            className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                              isActive
                                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                                : "text-gray-300 hover:text-white hover:bg-gray-800 border border-transparent"
                            }`}
                          >
                            <Icon className={`w-4 h-4 mr-3 transition-colors duration-300 ${
                              isActive ? "text-white" : "text-gray-400"
                            }`} />
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Auth */}
              <div className="border-t border-gray-800 pt-4 mt-4">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl border border-blue-500 mb-3 shadow-sm">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3 shadow-md">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-white">
                        Welcome, <span className="text-blue-700">{user?.username}</span>
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 py-4 text-base border-0"
                    >
                      <LogOut className="w-5 h-5 mr-2" />
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center w-full"
                  >
                    <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 w-full py-4 text-base border-0">
                      <LogIn className="w-5 h-5 mr-2" />
                      Login
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Animation Styles */}
      <style>{`
        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in-up {
          animation: slide-in-up 0.3s ease-out;
        }
      `}</style>
    </nav>
  );
};

export default Navigation;
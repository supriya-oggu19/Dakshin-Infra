import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: any;
  login: (token: string, user?: any) => void;
  logout: () => void;
  getToken: () => string | null;
  setUser: (user: any) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUserState] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  // Initialize auth state from sessionStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = sessionStorage.getItem("auth_token");
        const storedUser = sessionStorage.getItem("auth_user");
        
        if (storedToken) {
          setToken(storedToken);
          setIsAuthenticated(true);
        }
        
        if (storedUser) {
          setUserState(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        // Clear corrupted storage
        sessionStorage.removeItem("auth_token");
        sessionStorage.removeItem("auth_user");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (newToken: string, userData?: any) => {
    setToken(newToken);
    setIsAuthenticated(true);
    setUserState(userData || null);
    
    sessionStorage.setItem("auth_token", newToken);
    if (userData) {
      sessionStorage.setItem("auth_user", JSON.stringify(userData));
    }
  };

  const logout = () => {
    setToken(null);
    setIsAuthenticated(false);
    setUserState(null);
    
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_user");
  };

  const getToken = () => {
    return token || sessionStorage.getItem("auth_token");
  };

  const setUser = (userData: any) => {
    setUserState(userData);
    if (userData) {
      sessionStorage.setItem("auth_user", JSON.stringify(userData));
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        token, 
        user,
        login, 
        logout, 
        getToken,
        setUser,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
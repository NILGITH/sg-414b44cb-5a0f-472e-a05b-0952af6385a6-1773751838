import { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true, // Initialize loading to true
  login: async () => false,
  adminLogin: async () => false,
  logout: () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    // Authentification pour utilisateur principal avec nouveaux identifiants sécurisés
    if (email === "user.capec@cires-ci.org" && password === "CapecUser2024!@#") {
      const userData: User = {
        id: "1",
        name: "Utilisateur Principal CAPEC",
        email: "user.capec@cires-ci.org",
        role: "user"
      };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      setLoading(false);
      return true;
    }
    
    setLoading(false);
    return false;
  };

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    // Authentification pour administrateur avec nouveaux identifiants sécurisés
    if (email === "admin.capec@cires-ci.org" && password === "CapecAdmin2024!@#") {
      const userData: User = {
        id: "2",
        name: "Administrateur CAPEC",
        email: "admin.capec@cires-ci.org",
        role: "admin"
      };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      setLoading(false);
      return true;
    }
    
    setLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    // Optionally redirect to login page after logout
    // window.location.href = "/login"; 
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false); // Set loading to false after checking local storage
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, adminLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

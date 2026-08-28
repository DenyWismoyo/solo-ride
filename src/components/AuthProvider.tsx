"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { useAuth } from "@/hooks/useAuth";
import { UserDocument, UserRole } from "@/types/user.types";

interface AuthContextType {
  user: FirebaseUser | null;
  userData: UserDocument | null;
  loading: boolean;
  error: Error | null;
  impersonatedRole: UserRole | null;
  setImpersonatedRole: (role: UserRole | null) => void;
  activeRole: UserRole;
  isImpersonating: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  error: null,
  impersonatedRole: null,
  setImpersonatedRole: () => {},
  activeRole: "customer",
  isImpersonating: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [impersonatedRole, setImpersonatedRole] = useState<UserRole | null>(null);

  // Load any active impersonation from sessionStorage if exists
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("ride_solo_impersonate_role");
      if (saved) {
        setImpersonatedRole(saved as UserRole);
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  const handleSetImpersonatedRole = (role: UserRole | null) => {
    setImpersonatedRole(role);
    try {
      if (role) {
        sessionStorage.setItem("ride_solo_impersonate_role", role);
      } else {
        sessionStorage.removeItem("ride_solo_impersonate_role");
      }
    } catch (e) {
      // Ignore
    }
  };

  const isImpersonating = impersonatedRole !== null;
  const activeRole: UserRole = impersonatedRole || auth.userData?.role || "customer";

  return (
    <AuthContext.Provider 
      value={{ 
        ...auth, 
        impersonatedRole, 
        setImpersonatedRole: handleSetImpersonatedRole,
        activeRole,
        isImpersonating
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}

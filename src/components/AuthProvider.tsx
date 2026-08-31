"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { useAuth } from "@/hooks/useAuth";
import { UserDocument, UserRole } from "@/types/user.types";
import { SandboxPersona, SANDBOX_PERSONAS } from "@/types/sandbox.types";

interface AuthContextType {
  user: FirebaseUser | null;
  userData: UserDocument | null;
  loading: boolean;
  error: Error | null;
  impersonatedRole: UserRole | null;
  setImpersonatedRole: (role: UserRole | null) => void;
  impersonatedPersona: SandboxPersona | null;
  setImpersonatedPersona: (persona: SandboxPersona | null) => void;
  activeRole: UserRole;
  isImpersonating: boolean;
  effectiveUid: string | undefined;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  error: null,
  impersonatedRole: null,
  setImpersonatedRole: () => {},
  impersonatedPersona: null,
  setImpersonatedPersona: () => {},
  activeRole: "customer",
  isImpersonating: false,
  effectiveUid: undefined,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [impersonatedRole, setImpersonatedRole] = useState<UserRole | null>(null);
  const [impersonatedPersona, setImpersonatedPersonaState] = useState<SandboxPersona | null>(null);

  // Load any active impersonation from sessionStorage if exists
  useEffect(() => {
    try {
      const savedPersonaId = sessionStorage.getItem("ride_solo_impersonate_persona_id");
      if (savedPersonaId) {
        const found = SANDBOX_PERSONAS.find((p) => p.id === savedPersonaId);
        if (found) {
          setImpersonatedPersonaState(found);
          setImpersonatedRole(found.role);
          return;
        }
      }

      const savedRole = sessionStorage.getItem("ride_solo_impersonate_role");
      if (savedRole) {
        setImpersonatedRole(savedRole as UserRole);
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  const handleSetImpersonatedRole = (role: UserRole | null) => {
    setImpersonatedRole(role);
    setImpersonatedPersonaState(null);
    try {
      sessionStorage.removeItem("ride_solo_impersonate_persona_id");
      if (role) {
        sessionStorage.setItem("ride_solo_impersonate_role", role);
      } else {
        sessionStorage.removeItem("ride_solo_impersonate_role");
      }
    } catch (e) {
      // Ignore
    }
  };

  const handleSetImpersonatedPersona = (persona: SandboxPersona | null) => {
    setImpersonatedPersonaState(persona);
    if (persona) {
      setImpersonatedRole(persona.role);
      try {
        sessionStorage.setItem("ride_solo_impersonate_persona_id", persona.id);
        sessionStorage.setItem("ride_solo_impersonate_role", persona.role);
      } catch (e) {}
    } else {
      setImpersonatedRole(null);
      try {
        sessionStorage.removeItem("ride_solo_impersonate_persona_id");
        sessionStorage.removeItem("ride_solo_impersonate_role");
      } catch (e) {}
    }
  };

  const isImpersonating = impersonatedRole !== null || impersonatedPersona !== null;
  const activeRole: UserRole = impersonatedPersona?.role || impersonatedRole || auth.userData?.role || "customer";
  const effectiveUid = impersonatedPersona?.id || auth.user?.uid;

  return (
    <AuthContext.Provider 
      value={{ 
        ...auth, 
        impersonatedRole, 
        setImpersonatedRole: handleSetImpersonatedRole,
        impersonatedPersona,
        setImpersonatedPersona: handleSetImpersonatedPersona,
        activeRole,
        isImpersonating,
        effectiveUid
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}

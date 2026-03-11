"use client";

import { supabase } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: User | null;
  userIdentities: Array<string> | null;
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userIdentities: null,
  session: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userIdentities, setUserIdentities] = useState<Array<string>>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log(`Auth Event: ${event}`, currentSession);

      if (event === "SIGNED_OUT") {
        setSession(null);
        setUser(null);
        setUserIdentities([]);
        setLoading(false);
      } else {
        // Perform blocking network request to ensure data is up-to-date
        // Supabase JS library has issue with Locking API, and would cause other functions to hang/fail
        // https://github.com/supabase/supabase-js/issues/2013
        setSession(currentSession);
        supabase.auth.getUser().then(({ data: { user } }) => {
          setUser(user);
          setUserIdentities(
            user?.identities?.map((identity) => identity.provider) ?? [],
          );
        });
        setUser(currentSession?.user ?? null);
        setUserIdentities(
          currentSession?.user?.identities?.map(
            (identity) => identity.provider,
          ) ?? [],
        );
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userIdentities, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

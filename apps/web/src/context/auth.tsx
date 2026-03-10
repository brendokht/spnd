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
    supabase.auth.getSession().then(({ data }) => {
      // Refresh session if there is a new email, in an attempt to visually show the correct email
      if (data.session?.user.new_email)
        supabase.auth.refreshSession().then(({ data }) => {
          setSession(data.session);
          setUser(data.session?.user ?? null);
        });
      else {
        setSession(data.session);
        setUser(data.session?.user ?? null);
      }
      setLoading(false);
    });

    supabase.auth.getUserIdentities().then(({ data, error }) => {
      if (error) {
        console.error("getUserIdentities Error", error);
        return;
      }
      if (data?.identities) {
        setUserIdentities(data.identities.map((identity) => identity.provider));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") {
        setSession(session);
        setUser(session?.user ?? null);
      } else if (event === "SIGNED_IN") {
        setSession(session);
        setUser(session?.user ?? null);
      } else if (event === "SIGNED_OUT") {
        setSession(null);
        setUser(null);
      } else if (event === "USER_UPDATED") {
        setSession(session);
        setUser(session?.user ?? null);
      } else if (event === "TOKEN_REFRESHED") {
        setSession(session);
        setUser(session?.user ?? null);
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

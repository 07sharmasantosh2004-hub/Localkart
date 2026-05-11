import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export type ProfileRole = "customer" | "owner" | "admin";

export interface AuthProfile {
  id: string;
  role: ProfileRole;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  status?: "active" | "blocked" | null;
  is_blocked?: boolean | null;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: AuthProfile | null;
  role: ProfileRole | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signInLocalAdmin: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const LOCAL_ADMIN_STORAGE_KEY = "localkart-local-admin-session";
const LOCAL_ADMIN_ID = "00000000-0000-0000-0000-000000000000";
const isLocalAdminEnabled = import.meta.env.DEV;

function getLocalAdminProfile(): AuthProfile {
  return {
    id: LOCAL_ADMIN_ID,
    role: "admin",
    full_name: "LocalKart Admin",
    phone: null,
    avatar_url: null,
    status: "active",
    is_blocked: false,
  };
}

function getLocalAdminUser(): User {
  return {
    id: LOCAL_ADMIN_ID,
    email: import.meta.env.VITE_LOCALKART_ADMIN_EMAIL || "admin@localkart.local",
    aud: "authenticated",
    role: "authenticated",
    app_metadata: {},
    user_metadata: { role: "admin" },
    created_at: new Date(0).toISOString(),
  } as User;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [localAdminUser, setLocalAdminUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, role, full_name, phone, avatar_url, status, is_blocked")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      setProfile(null);
      return;
    }

    const nextProfile = (data as AuthProfile | null) ?? null;
    setProfile(nextProfile && (nextProfile.status === "blocked" || nextProfile.is_blocked) ? null : nextProfile);
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user.id) {
        await loadProfile(data.session.user.id);
      } else if (isLocalAdminEnabled && localStorage.getItem(LOCAL_ADMIN_STORAGE_KEY) === "true") {
        setLocalAdminUser(getLocalAdminUser());
        setProfile(getLocalAdminProfile());
      } else {
        setProfile(null);
      }
      if (mounted) setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user.id) {
        setLocalAdminUser(null);
        void loadProfile(nextSession.user.id);
      } else if (isLocalAdminEnabled && localStorage.getItem(LOCAL_ADMIN_STORAGE_KEY) === "true") {
        setLocalAdminUser(getLocalAdminUser());
        setProfile(getLocalAdminProfile());
      } else {
        setLocalAdminUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (localAdminUser) {
      setProfile(getLocalAdminProfile());
      return;
    }

    await loadProfile(session?.user.id);
  }, [loadProfile, localAdminUser, session?.user.id]);

  const signInLocalAdmin = useCallback(() => {
    if (!isLocalAdminEnabled) return;

    const nextUser = getLocalAdminUser();
    localStorage.setItem(LOCAL_ADMIN_STORAGE_KEY, "true");
    setSession(null);
    setLocalAdminUser(nextUser);
    setProfile(getLocalAdminProfile());
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem(LOCAL_ADMIN_STORAGE_KEY);
    await supabase.auth.signOut();
    setSession(null);
    setLocalAdminUser(null);
    setProfile(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? localAdminUser,
      session,
      profile,
      role: profile?.role ?? null,
      loading,
      refreshProfile,
      signInLocalAdmin,
      signOut,
    }),
    [loading, localAdminUser, profile, refreshProfile, session, signInLocalAdmin, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

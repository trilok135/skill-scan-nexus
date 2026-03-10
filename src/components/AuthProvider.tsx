import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);

                // Handle email confirmation events
                if (event === 'USER_UPDATED' && session?.user?.email_confirmed_at) {
                    console.log('Email confirmed for:', session.user.email);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate("/login", { replace: true });
        } else if (!loading && user) {
            // Check onboarding status for authenticated users
            // @ts-ignore - Supabase types might not be fully synced yet
            supabase
                .from('students')
                .select('onboarding_complete')
                .eq('user_id', user.id)
                .single()
                .then(({ data, error }: { data: any, error: any }) => {
                    // Don't redirect if we are already on onboarding path, prevent infinite loops
                    const isCurrentlyOnboarding = window.location.pathname === '/onboarding';
                    if (!error && data && !data.onboarding_complete && !isCurrentlyOnboarding) {
                        navigate('/onboarding', { replace: true });
                    }
                });
        }
    }, [user, loading, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return <>{children}</>;
}

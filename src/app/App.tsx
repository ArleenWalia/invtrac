import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { AuthScreen } from "./components/AuthScreen";
import { InventoryScreen } from "./components/InventoryScreen";

export default function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount and listen for auth changes
  useEffect(() => {
    checkSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      if (event === 'SIGNED_OUT') {
        setAccessToken(null);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.access_token) {
          setAccessToken(session.access_token);
        }
      } else if (session?.access_token) {
        setAccessToken(session.access_token);
      } else {
        setAccessToken(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error checking session:", error);
        setAccessToken(null);
      } else if (session?.access_token) {
        setAccessToken(session.access_token);
      } else {
        setAccessToken(null);
      }
    } catch (error) {
      console.error("Error checking session:", error);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (token: string) => {
    console.log("User logged in, token:", token.substring(0, 30) + "...");
    
    // Get user info to log who's logging in
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (user) {
        console.log("Logged in user ID:", user.id);
        console.log("Logged in user email:", user.email);
      } else if (error) {
        console.error("Error getting user info:", error);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
    
    setAccessToken(token);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setAccessToken(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Function to get a fresh token
  const getAccessToken = async (): Promise<string | null> => {
    try {
      // Get current session - Supabase will auto-refresh if needed
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error getting session:", error);
        return null;
      }
      
      if (session?.access_token) {
        // Update the local state with the token
        if (session.access_token !== accessToken) {
          setAccessToken(session.access_token);
        }
        return session.access_token;
      }
      
      return null;
    } catch (error) {
      console.error("Error getting fresh token:", error);
      return null;
    }
  };

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="size-full">
      {!accessToken ? (
        <AuthScreen onLogin={handleLogin} />
      ) : (
        <InventoryScreen 
          accessToken={accessToken} 
          onLogout={handleLogout}
          getAccessToken={getAccessToken}
        />
      )}
    </div>
  );
}
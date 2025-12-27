import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { supabase } from "../../lib/supabase";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import logoImage from "./assets/8d4f1cc1e3fae072d4cd287922a40a0032818d13.png";

interface AuthScreenProps {
  onLogin: (accessToken: string) => void;
}

export function AuthScreen({ onLogin }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up via our server endpoint
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-b468c741/signup`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ email, password }),
          }
        );

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to create account");
        }

        // After successful signup, sign in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        
        if (signInData?.session?.access_token) {
          onLogin(signInData.session.access_token);
        }
      } else {
        // Sign in
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        if (data?.session?.access_token) {
          onLogin(data.session.access_token);
        }
      }
    } catch (err: any) {
      console.error("Authentication error:", err);
      // Provide more user-friendly error messages
      let errorMessage = err.message || "Authentication failed";
      
      if (errorMessage.includes("Invalid login credentials")) {
        errorMessage = isSignUp 
          ? "Failed to create account. Please try again." 
          : "Invalid email or password. Please check your credentials or sign up for a new account.";
      } else if (errorMessage.includes("User already registered")) {
        errorMessage = "An account with this email already exists. Please sign in instead.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img 
              src={logoImage} 
              alt="InvTrac Logo" 
              className="h-32 w-auto" 
              style={{ mixBlendMode: 'multiply' }}
            />
          </div>
          <p className="text-gray-500">Track your inventory with ease</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="h-12 bg-white border-gray-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
              className="h-12 bg-white border-gray-200"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-xl disabled:opacity-50"
          >
            {loading ? "Loading..." : (isSignUp ? "Sign Up" : "Sign In")}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            disabled={loading}
            className="text-blue-500 hover:text-blue-600 disabled:opacity-50"
          >
            {isSignUp
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
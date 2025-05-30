"use client";

import { LoginInput } from "@/components/forms/login-form";
import { SignupInput } from "@/components/forms/signup-form";
import { config } from "@/config";
import { jwtDecode } from "jwt-decode";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

type JwtToken = { userId: number; role: string; exp: number };
type User = { id: number; isAdmin: boolean; token: string };

interface AuthContextType {
  user?: User;
  isLoading: boolean;
  signup: (input: SignupInput) => Promise<void>;
  login: (input: LoginInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations("AuthContext");
  const [user, setUser] = useState<User>();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const signup = async (input: SignupInput) => {
    setIsLoading(true);

    const res = await fetch(`${config.api.baseUrl}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (res.ok) {
      const { token } = await res.json();
      const decoded = jwtDecode<JwtToken>(token);

      setUser({ id: decoded.userId, isAdmin: decoded.role === "admin", token });
      localStorage.setItem("token", token);

      router.refresh();
    } else {
      toast(t("somethingWentWrong"));
    }
    setIsLoading(false);
  };

  const login = async (input: LoginInput) => {
    setIsLoading(true);

    const res = await fetch(`${config.api.baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (res.ok) {
      const { token } = await res.json();
      const decoded = jwtDecode<JwtToken>(token);

      setUser({ id: decoded.userId, isAdmin: decoded.role === "admin", token });
      localStorage.setItem("token", token);

      router.refresh();
    } else {
      toast(t("somethingWentWrong"));
    }
    setIsLoading(false);
  };

  const logout = useCallback(() => {
    setUser(undefined);
    localStorage.removeItem("token");
    router.push("/");
  }, [router]);

  useEffect(() => {
    setIsLoading(true);
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      const decoded = jwtDecode<JwtToken>(storedToken);
      const isTokenExpired = decoded.exp * 1000 <= Date.now();

      if (isTokenExpired) {
        toast(t("sessionExpired"));
        logout();
      } else {
        setUser({
          id: decoded.userId,
          isAdmin: decoded.role == "admin",
          token: storedToken,
        });
      }
    }
    setIsLoading(false);
  }, [logout, t]);

  return (
    <AuthContext.Provider value={{ user, isLoading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

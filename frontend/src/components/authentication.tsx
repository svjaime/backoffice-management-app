"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/auth-context";
import { Loader } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { LoginForm } from "./forms/login-form";
import { SignupForm } from "./forms/signup-form";

export default function Authentication() {
  const t = useTranslations("Authentication");
  const { user, isLoading, logout } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsAuthenticated(!!user);
    }
  }, [isLoading, user]);

  if (isLoading) {
    return <Loader className="animate-spin" />;
  }

  if (isAuthenticated) {
    return <Button onClick={logout}>{t("logout")}</Button>;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">
          {t("login")}/{t("signup")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Tabs defaultValue="login">
          <TabsList className="my-4 w-full">
            <TabsTrigger value="login">{t("login")}</TabsTrigger>
            <TabsTrigger value="signup">{t("signup")}</TabsTrigger>
          </TabsList>
          <TabsContent className="space-y-5" value="login">
            <DialogHeader>
              <DialogTitle>{t("login")}</DialogTitle>
              <DialogDescription>{t("loginDescription")}</DialogDescription>
            </DialogHeader>
            <LoginForm />
          </TabsContent>
          <TabsContent className="space-y-5" value="signup">
            <DialogHeader>
              <DialogTitle>{t("signup")}</DialogTitle>
              <DialogDescription>{t("signUpDescription")}</DialogDescription>
            </DialogHeader>
            <SignupForm />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

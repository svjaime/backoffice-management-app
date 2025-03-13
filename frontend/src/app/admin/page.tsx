"use client";

import Forbidden from "@/components/forbidden";
import { useAuth } from "@/context/auth-context";
import { Loader } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const t = useTranslations("AdminPage");
  const { user, isLoading } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsAuthenticated(!!user);
    }
  }, [isLoading, user]);

  if (isLoading) {
    return <Loader className="animate-spin" />;
  }

  if (isAuthenticated && user?.isAdmin) {
    return t("title");
  }

  return <Forbidden />;
}

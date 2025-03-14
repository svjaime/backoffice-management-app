"use client";

import Forbidden from "@/components/forbidden";
import { CreateTransactionForm } from "@/components/forms/create-transaction-form";
import { useAuth } from "@/context/auth-context";
import { Loader } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const t = useTranslations("DashboardPage");
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
    return (
      <div className="flex w-full flex-col">
        <h1 className="my-8 text-2xl font-bold uppercase">
          {t("createTransaction")}
        </h1>
        <div className="rounded-lg border p-5">
          <CreateTransactionForm />
        </div>
      </div>
    );
  }

  return <Forbidden />;
}

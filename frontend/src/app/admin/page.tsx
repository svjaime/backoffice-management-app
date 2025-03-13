"use client";

import Forbidden from "@/components/forbidden";
import UsersTable from "@/components/users-table";
import { useAuth } from "@/context/auth-context";
import { User, useUsers } from "@/hooks/users";
import { Loader } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const t = useTranslations("AdminPage");
  const { user, isLoading } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const usersQuery = useUsers();

  useEffect(() => {
    if (!isLoading) {
      setIsAuthenticated(!!user);
    }
  }, [isLoading, user]);

  useEffect(() => {
    setUsers(usersQuery.data ?? []);
  }, [usersQuery.data]);

  if (isLoading) {
    return <Loader className="animate-spin" />;
  }

  if (isAuthenticated && user?.isAdmin) {
    return (
      <div className="flex w-full flex-col">
        <h1 className="my-8 text-center text-3xl font-bold uppercase">
          {t("manageUsers")}
        </h1>
        <UsersTable users={users} isLoading={usersQuery.isLoading} />
      </div>
    );
  }

  return <Forbidden />;
}

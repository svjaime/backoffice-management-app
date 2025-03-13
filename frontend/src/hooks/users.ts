import { useAuth } from "@/context/auth-context";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.string().datetime(),
  role: z.object({ id: z.number(), name: z.string() }),
});

export type User = z.infer<typeof userSchema>;

export function useUsers() {
  const { user, logout } = useAuth();
  const token = user?.token ?? "";

  return useQuery<User[]>({
    queryKey: ["users", token],
    queryFn: async () => {
      try {
        return await fetchUsers(token);
      } catch (err) {
        if (err instanceof Error && err.message === "Unauthorized") {
          logout();
        }
        throw err;
      }
    },
    enabled: !!token && user?.isAdmin,
  });
}

const fetchUsers = async (token: string) => {
  const res = await fetch("http://localhost:8787/api/users", {
    method: "GET",
    headers: [
      ["Content-Type", "application/json"],
      ["Authorization", `Bearer ${token}`],
    ],
  });

  if (res.status === 401) {
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }
  const data = await res.json();

  return z.array(userSchema).parse(data);
};

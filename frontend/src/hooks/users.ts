import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.string().datetime(),
  role: z.object({ id: z.number(), name: z.string() }),
});

type User = z.infer<typeof userSchema>;

export function useUsers(token = "") {
  return useQuery<User[]>({
    queryKey: ["users", token],
    queryFn: () => fetchUsers(token),
    enabled: !!token,
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

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }
  const data = await res.json();

  return z.array(userSchema).parse(data);
};

import { config } from "@/config";
import { useAuth } from "@/context/auth-context";
import { transactionSubTypeSchema } from "@/hooks/transactions";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const revenueSchema = z.object({
  weeklyRevenue: z.array(
    z.object({
      subType: transactionSubTypeSchema,
      _sum: z.object({ amount: z.number() }),
    }),
  ),
  monthlyRevenue: z.array(
    z.object({
      subType: transactionSubTypeSchema,
      _sum: z.object({ amount: z.number() }),
    }),
  ),
});

export const useRevenue = () => {
  const { user, logout } = useAuth();
  const token = user?.token ?? "";

  return useQuery({
    queryKey: ["revenue"],
    queryFn: async () => {
      try {
        return await fetchRevenue(token);
      } catch (err) {
        if (err instanceof Error && err.message === "Unauthorized") {
          logout();
        }
        throw err;
      }
    },
    staleTime: 1000 * 60, // Cache for 1 minute
    enabled: !!token,
  });
};

const fetchRevenue = async (token: string) => {
  const res = await fetch(`${config.api.baseUrl}/api/transactions/revenue`, {
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
    throw new Error("Failed to fetch revenue data");
  }
  const data = await res.json();

  return revenueSchema.parse(data);
};

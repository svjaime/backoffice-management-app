import { CreateTransactionInput } from "@/components/forms/create-transaction-form";
import { config } from "@/config";
import { useAuth } from "@/context/auth-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { z } from "zod";
import { userSchema } from "./users";

export const transactionSchema = z.object({
  id: z.number(),
  type: z.enum(["deposit", "credit"]),
  subType: z.enum(["reward", "purchase", "refund"]),
  amount: z.number(),
  status: z.enum(["pending", "failed", "completed"]),
  description: z.string().optional(),
  user: userSchema,
  createdAt: z.string().datetime(),
});

export type Transaction = z.infer<typeof transactionSchema>;

export function useGetTransactions() {
  const { user, logout } = useAuth();
  const token = user?.token ?? "";

  return useQuery<Transaction[]>({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      try {
        return await fetchTransactions(token, user?.id ?? 0);
      } catch (err) {
        if (err instanceof Error && err.message === "Unauthorized") {
          logout();
        }
        throw err;
      }
    },
    enabled: !!token && !!user?.id,
  });
}

export function useTransactionActions() {
  const queryClient = useQueryClient();
  const t = useTranslations("TransactionsHook");
  const { user, logout } = useAuth();
  const token = user?.token ?? "";

  const createTransactionMutation = useMutation({
    mutationFn: async (transaction: CreateTransactionInput) => {
      try {
        return await createTransaction(token, transaction);
      } catch (err) {
        if (err instanceof Error && err.message === "Unauthorized") {
          logout();
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast(t("createTransactionSuccess"));
    },
    onError: () => {
      toast(t("somethingWentWrong"));
    },
  });

  return { createTransactionMutation };
}

const fetchTransactions = async (token: string, userId: number) => {
  const params = new URLSearchParams({ userId: String(userId) }).toString();
  const res = await fetch(`${config.api.baseUrl}/api/transactions?${params}`, {
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
    throw new Error("Failed to fetch transactions");
  }
  const data = await res.json();

  return z.array(transactionSchema).parse(data);
};

const createTransaction = async (
  token: string,
  transaction: CreateTransactionInput,
) => {
  const res = await fetch(`${config.api.baseUrl}/api/transactions`, {
    method: "POST",
    headers: [
      ["Content-Type", "application/json"],
      ["Authorization", `Bearer ${token}`],
    ],
    body: JSON.stringify(transaction),
  });

  if (res.status === 401) {
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    throw new Error("Failed to create transaction");
  }
};

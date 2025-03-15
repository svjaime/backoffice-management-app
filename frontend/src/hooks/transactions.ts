import { CreateTransactionInput } from "@/components/forms/create-transaction-form";
import { config } from "@/config";
import { useAuth } from "@/context/auth-context";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { z } from "zod";

export const transactionSchema = z.object({
  id: z.number(),
  type: z.enum(["deposit", "credit"]),
  subType: z.enum(["reward", "purchase", "refund"]),
  amount: z.number(),
  status: z.enum(["pending", "failed", "completed"]),
  description: z.string().optional(),
  userId: z.number(),
  createdAt: z.string().datetime(),
});

export type Transaction = z.infer<typeof transactionSchema>;
export type TransactionsSortKey = keyof Transaction;

type GetTransactionsParams = {
  userId: number;
  pageIndex: number;
  pageSize: number;
  filters: Record<string, string>;
  sorting: { id: string; desc: boolean }[];
};

export function useGetTransactions(queryParams: GetTransactionsParams) {
  const { user, logout } = useAuth();
  const token = user?.token ?? "";

  return useQuery<{ transactions: Transaction[]; total: number }>({
    queryKey: ["transactions", queryParams],
    queryFn: async () => {
      try {
        return await fetchTransactions(token, queryParams);
      } catch (err) {
        if (err instanceof Error && err.message === "Unauthorized") {
          logout();
        }
        throw err;
      }
    },
    placeholderData: keepPreviousData,
    enabled: !!token,
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

const fetchTransactions = async (
  token: string,
  { userId, pageIndex, pageSize, filters, sorting }: GetTransactionsParams,
) => {
  const params = new URLSearchParams({
    userId: String(userId),
    page: String(pageIndex + 1),
    limit: String(pageSize),
    ...filters,
    sortField: sorting[0]?.id || "createdAt",
    sortOrder: sorting[0]?.desc ? "desc" : "asc",
  }).toString();

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

  return z
    .object({ transactions: z.array(transactionSchema), total: z.number() })
    .parse(data);
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

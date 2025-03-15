import { transactionSchema } from "@/hooks/transactions";
import { useTranslations } from "next-intl";
import { z } from "zod";

type TransactionStatus = z.infer<typeof transactionSchema>["status"];

interface Props {
  status: TransactionStatus;
}

const transactionStatus = {
  completed: { messageKey: "completed", color: "text-green-500" },
  pending: { messageKey: "pending", color: "text-yellow-500" },
  failed: { messageKey: "failed", color: "text-red-500" },
} as const;

export default function TransactionStatusLabel({ status }: Props) {
  const t = useTranslations("TransactionStatusLabel");

  const { messageKey, color } = transactionStatus[status];

  return <p className={color}>{t(messageKey)}</p>;
}

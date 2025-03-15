import TransactionSubTypeBadge from "@/components/badges/transaction-subtype";
import TransactionTypeBadge from "@/components/badges/transaction-type";
import CurrencyLabel from "@/components/labels/currency";
import TransactionStatusLabel from "@/components/labels/transaction-status";
import { Transaction } from "@/hooks/transactions";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

interface TransactionDetailsProps {
  transaction: Transaction;
}

export default function TransactionDetails({
  transaction,
}: TransactionDetailsProps) {
  const t = useTranslations("TransactionDetails");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="opacity-65">{t("id")}:</span>
          <div className="font-medium">{transaction.id}</div>
        </div>
        <div>
          <span className="opacity-65">{t("userId")}:</span>
          <div className="font-medium">{transaction.userId}</div>
        </div>
        <div className="flex gap-2">
          <span className="opacity-65">{t("type")}:</span>
          <TransactionTypeBadge type={transaction.type} />
        </div>
        <div className="flex gap-2">
          <span className="opacity-65">{t("subType")}:</span>
          <TransactionSubTypeBadge subType={transaction.subType} />
        </div>
        <div>
          <span className="opacity-65">{t("amount")}:</span>
          <div className="font-medium">
            <CurrencyLabel value={transaction.amount} />
          </div>
        </div>
        <div>
          <span className="opacity-65">{t("status")}:</span>
          <TransactionStatusLabel status={transaction.status} />
        </div>
        <div className="col-span-2">
          <span className="opacity-65">{t("createdAt")}:</span>
          <div className="font-medium">
            {format(new Date(transaction.createdAt), "Pp")}
          </div>
        </div>
        {transaction.description && (
          <div className="col-span-2">
            <span className="opacity-65">{t("description")}:</span>
            <div className="font-medium">{transaction.description}</div>
          </div>
        )}
      </div>
    </div>
  );
}

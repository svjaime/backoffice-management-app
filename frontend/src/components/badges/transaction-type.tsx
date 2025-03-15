import { Badge } from "@/components/ui/badge";
import { transactionSchema } from "@/hooks/transactions";
import { CreditCard, HandCoins } from "lucide-react";
import { useTranslations } from "next-intl";
import { z } from "zod";

type TransactionType = z.infer<typeof transactionSchema>["type"];

interface Props {
  type: TransactionType;
}

const transactionType = {
  deposit: { messageKey: "deposit", Icon: HandCoins },
  credit: { messageKey: "credit", Icon: CreditCard },
} as const;

export default function TransactionTypeBadge({ type }: Props) {
  const t = useTranslations("TransactionTypeBadge");

  const { messageKey, Icon } = transactionType[type];

  return (
    <Badge variant="secondary">
      <Icon />
      {t(messageKey)}
    </Badge>
  );
}

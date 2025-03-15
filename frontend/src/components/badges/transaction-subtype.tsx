import { Badge } from "@/components/ui/badge";
import { transactionSchema } from "@/hooks/transactions";
import { useTranslations } from "next-intl";
import { z } from "zod";

type TransactionSubType = z.infer<typeof transactionSchema>["subType"];

interface Props {
  subType: TransactionSubType;
}

const transactionSubType = {
  reward: { messageKey: "reward" },
  purchase: { messageKey: "purchase" },
  refund: { messageKey: "refund" },
} as const;

export default function TransactionSubTypeBadge({ subType }: Props) {
  const t = useTranslations("TransactionSubTypeBadge");

  const { messageKey } = transactionSubType[subType];

  return <Badge variant="outline">{t(messageKey)}</Badge>;
}

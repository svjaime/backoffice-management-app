import { Badge } from "@/components/ui/badge";
import { userSchema } from "@/hooks/users";
import { useTranslations } from "next-intl";
import { z } from "zod";

type Role = z.infer<typeof userSchema>["role"]["name"];

interface Props {
  role: Role;
}

const userRole = {
  admin: { messageKey: "admin", variant: "default" },
  user: { messageKey: "user", variant: "secondary" },
} as const;

export default function UserRoleBadge({ role }: Props) {
  const t = useTranslations("UserRoleBadge");

  const { messageKey, variant } = userRole[role];

  return <Badge variant={variant}>{t(messageKey)}</Badge>;
}

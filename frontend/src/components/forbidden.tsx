import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleAlert } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Forbidden() {
  const t = useTranslations("Forbidden");

  return (
    <div className="w-full">
      <Alert>
        <CircleAlert />
        <AlertTitle>{t("forbidden")}</AlertTitle>
        <AlertDescription>{t("forbiddenBlurb")}</AlertDescription>
      </Alert>
    </div>
  );
}

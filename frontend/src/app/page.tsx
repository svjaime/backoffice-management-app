import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("HomePage");

  return (
    <main>
      <h1>{t("title")}</h1>
      <Button>Testing Shadcn</Button>
    </main>
  );
}

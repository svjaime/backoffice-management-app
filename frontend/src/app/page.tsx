import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("HomePage");

  return (
    <div className="mt-10 flex w-full flex-col items-center gap-4">
      <h1 className="text-3xl font-bold uppercase">{t("title")}</h1>
      <p>{t("description")}</p>
    </div>
  );
}

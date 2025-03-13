import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="flex justify-end">
      <p className="text-xs font-extralight">{t("madeBy")}</p>
    </footer>
  );
}

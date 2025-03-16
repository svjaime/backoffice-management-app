import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import BarChart from "@/components/ui/bar-chart";
import { useRevenue } from "@/hooks/revenue";
import { transactionSubTypeSchema } from "@/hooks/transactions";
import { CircleX, Loader } from "lucide-react";
import { useTranslations } from "next-intl";
import { z } from "zod";

type SubType = z.infer<typeof transactionSubTypeSchema>;
const BASE_SUBTYPES: SubType[] = ["reward", "purchase", "refund"];

export default function RevenueBreakdown() {
  const { data, isLoading, error } = useRevenue();
  const t = useTranslations("RevenueBreakdown");

  const chartData = (data?: { subType: SubType; _sum: { amount: number } }[]) =>
    BASE_SUBTYPES.map((subType) => ({
      label: t("transactionSubtype", { subType }),
      value: data?.find((item) => item.subType === subType)?._sum.amount || 0,
    }));

  if (isLoading) {
    return <Loader className="animate-spin" />;
  }
  if (error) {
    return (
      <Alert>
        <CircleX />
        <AlertTitle>{t("error")}</AlertTitle>
        <AlertDescription>{t("failedToLoadData")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <h1 className="text-2xl font-bold">{t("revenueBreakdown")}</h1>
      <BarChart
        data={chartData(data?.weeklyRevenue)}
        title={t("thisWeekRevenue")}
      />
      <BarChart
        data={chartData(data?.monthlyRevenue)}
        title={t("thisMonthRevenue")}
      />
    </div>
  );
}

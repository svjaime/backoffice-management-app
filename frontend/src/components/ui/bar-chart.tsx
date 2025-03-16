import CurrencyLabel from "@/components/labels/currency";
import { useTranslations } from "next-intl";
import {
  Bar,
  BarChart as RBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  data: { label: string; value: number }[];
  title: string;
}

export default function BarChart({ data, title }: Props) {
  const t = useTranslations("BarChart");

  return (
    <div className="flex w-full flex-col gap-4 rounded-lg border p-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RBarChart data={data}>
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip
            formatter={(value: number, _name, _item, index) => [
              <CurrencyLabel value={value} key={index} />,
              t("total"),
            ]}
          />
          <Bar dataKey="value" fill="#8884d8" />
        </RBarChart>
      </ResponsiveContainer>
    </div>
  );
}

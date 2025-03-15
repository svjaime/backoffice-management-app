interface Props {
  value: number;
  currency?: string;
}

export default function CurrencyLabel({ currency = "USD", value }: Props) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    value,
  );
}

"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTransactionActions } from "@/hooks/transactions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  type: z.enum(["deposit", "credit"]),
  subType: z.enum(["reward", "purchase", "refund"]),
  amount: z.coerce.number().positive().finite(),
  status: z.enum(["pending", "failed", "completed"]),
  description: z.string().trim().max(50).optional(),
  userId: z.coerce.number().int().positive(),
});

export type CreateTransactionInput = z.infer<typeof formSchema>;

export function CreateTransactionForm() {
  const { createTransactionMutation } = useTransactionActions();
  const t = useTranslations("CreateTransactionForm");

  const form = useForm<CreateTransactionInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "credit",
      subType: "reward",
      amount: 10,
      status: "completed",
      description: "",
      userId: 1,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) =>
          createTransactionMutation.mutate(data),
        )}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("userId")}</FormLabel>
              <FormControl>
                <Input type="number" min={0} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("amount")}</FormLabel>
              <FormControl>
                <Input type="number" min={0} step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("type")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="deposit">{t("deposit")}</SelectItem>
                  <SelectItem value="credit">{t("credit")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("subType")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="reward">{t("reward")}</SelectItem>
                  <SelectItem value="purchase">{t("purchase")}</SelectItem>
                  <SelectItem value="refund">{t("refund")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("status")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pending">{t("pending")}</SelectItem>
                  <SelectItem value="failed">{t("failed")}</SelectItem>
                  <SelectItem value="completed">{t("completed")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("description")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("descriptionPlaceholder")}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={createTransactionMutation.isPending} type="submit">
          {createTransactionMutation.isPending && (
            <Loader className="animate-spin" />
          )}
          {t("submit")}
        </Button>
      </form>
    </Form>
  );
}

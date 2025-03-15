"use client";

import TransactionSubTypeBadge from "@/components/badges/transaction-subtype";
import TransactionTypeBadge from "@/components/badges/transaction-type";
import CurrencyLabel from "@/components/labels/currency";
import TransactionStatusLabel from "@/components/labels/transaction-status";
import TransactionDetails from "@/components/transaction-details";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/context/auth-context";
import { Transaction, useGetTransactions } from "@/hooks/transactions";
import {
  ColumnDef,
  getCoreRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

export default function TransactionsTable() {
  const t = useTranslations("TransactionsTable");
  const { user } = useAuth();

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState({ search: "", type: "", status: "" });
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns: ColumnDef<Transaction>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("id")} />
        ),
      },
      {
        accessorKey: "type",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("type")} />
        ),
        cell: ({ row }) => <TransactionTypeBadge type={row.original.type} />,
      },
      {
        accessorKey: "subType",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("subType")} />
        ),
        cell: ({ row }) => (
          <TransactionSubTypeBadge subType={row.original.subType} />
        ),
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("amount")} />
        ),
        cell: ({ row }) => <CurrencyLabel value={row.original.amount} />,
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("status")} />
        ),
        cell: ({ row }) => (
          <TransactionStatusLabel status={row.original.status} />
        ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("createdAt")} />
        ),
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt);
          return format(date, "Pp");
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const transaction = row.original;

          return (
            <div className="flex gap-2">
              <Dialog>
                <TooltipProvider>
                  <Tooltip>
                    <DialogTrigger asChild>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label={t("transactionDetails")}
                        >
                          <Info />
                        </Button>
                      </TooltipTrigger>
                    </DialogTrigger>
                    <TooltipContent>{t("transactionDetails")}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("transactionDetails")}</DialogTitle>
                  </DialogHeader>
                  <TransactionDetails transaction={transaction} />
                </DialogContent>
              </Dialog>
            </div>
          );
        },
      },
    ],
    [t],
  );

  const { data, isLoading } = useGetTransactions({
    userId: user?.id ?? 0,
    ...pagination,
    filters,
    sorting,
  });

  const table = useReactTable({
    data: data?.transactions ?? [],
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    onSortingChange: setSorting,
    manualFiltering: true,
    manualPagination: true,
    rowCount: data?.total,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    state: { pagination, sorting, columnVisibility },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Input
          placeholder={t("searchDescription")}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, search: e.target.value }))
          }
        />
        <Select
          onValueChange={(val) =>
            setFilters((prev) => ({
              ...prev,
              type: val === "reset" ? "" : val,
            }))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("type")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="reset">{t("all")}</SelectItem>
            <SelectItem value="deposit">{t("deposit")}</SelectItem>
            <SelectItem value="credit">{t("credit")}</SelectItem>
          </SelectContent>
        </Select>
        <Select
          onValueChange={(val) =>
            setFilters((prev) => ({
              ...prev,
              status: val === "reset" ? "" : val,
            }))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="reset">{t("all")}</SelectItem>
            <SelectItem value="pending">{t("pending")}</SelectItem>
            <SelectItem value="completed">{t("completed")}</SelectItem>
            <SelectItem value="failed">{t("failed")}</SelectItem>
          </SelectContent>
        </Select>
        <DataTableViewOptions table={table} />
      </div>
      <DataTable table={table} isLoading={isLoading} />
      <DataTablePagination table={table} />
    </div>
  );
}

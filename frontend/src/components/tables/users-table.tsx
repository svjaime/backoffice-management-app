"use client";

import { UpdateUserForm } from "@/components/forms/update-user-form";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { User, useUserActions } from "@/hooks/users";
import {
  ColumnDef,
  ColumnFiltersState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { Edit, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

interface UsersTableProps {
  users: User[];
  isLoading?: boolean;
}

export default function UsersTable({ users = [], isLoading }: UsersTableProps) {
  const t = useTranslations("UsersTable");
  const { deleteUserMutation } = useUserActions();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns: ColumnDef<User>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("id")} />
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("name")} />
        ),
      },
      {
        accessorKey: "email",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("email")} />
        ),
      },
      {
        accessorKey: "role.name",
        id: "role",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("role")} />
        ),
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
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
          const user = row.original;

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
                          aria-label={t("editUser")}
                        >
                          <Edit />
                        </Button>
                      </TooltipTrigger>
                    </DialogTrigger>
                    <TooltipContent>{t("editUser")}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("editUser")}</DialogTitle>
                  </DialogHeader>
                  <UpdateUserForm
                    userId={user.id}
                    defaults={{
                      name: user.name,
                      email: user.email,
                      role: user.role.name,
                    }}
                  />
                </DialogContent>
              </Dialog>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      aria-label={t("deleteUser")}
                      disabled={deleteUserMutation.isPending}
                      onClick={() => deleteUserMutation.mutate(user.id)}
                    >
                      <Trash2 />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("deleteUser")}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        },
      },
    ],
    [deleteUserMutation, t],
  );

  const table = useReactTable({
    data: users,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: users.length // this is a workaround for a known error idk: https://github.com/TanStack/table/issues/5026
      ? getFacetedUniqueValues()
      : undefined,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Input
          placeholder={t("filterUsers")}
          className="max-w-[300px]"
          disabled={!users.length}
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
        />
        {table.getColumn("role") && (
          <DataTableFacetedFilter
            column={table.getColumn("role")}
            disabled={!users.length}
            title={t("role")}
            options={[...new Set(users.map((item) => item.role.name))]
              .sort()
              .map((role) => ({ label: role, value: role }))}
          />
        )}
        {table.getState().columnFilters.length > 0 && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="px-2 lg:px-3"
          >
            {t("reset")}
            <X />
          </Button>
        )}
        <DataTableViewOptions table={table} />
      </div>
      <DataTable table={table} isLoading={isLoading} />
      <DataTablePagination table={table} />
    </div>
  );
}

import { Input } from "@/components/ui/input";
import type { Table } from "@tanstack/react-table";

interface DataTableSearchProps<TData> {
  table: Table<TData>;
  placeholder?: string;
}

export function DataTableSearch<TData>({ table, placeholder = "Search..." }: DataTableSearchProps<TData>) {
  return (
    <div className="px-1">
      <Input
        placeholder={placeholder}
        className="h-8 mb-1.5"
        value={table.getState().globalFilter ?? ""}
        onChange={(e) => table.setGlobalFilter(String(e.target.value))}
      />
    </div>
  );
}

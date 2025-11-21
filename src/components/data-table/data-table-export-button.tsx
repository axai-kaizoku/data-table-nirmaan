import { Button } from "@/components/ui/button";
import { exportTableToCSV } from "@/lib/export";
import type { Table } from "@tanstack/react-table";
import { Download } from "lucide-react";

interface DataTableExportButtonProps<TData> {
  table: Table<TData>;
  filename?: string;
  excludeColumns?: (keyof TData | "select" | "actions")[];
}

export function DataTableExportButton<TData>({
  table,
  filename = "export",
  excludeColumns = ["select", "actions"],
}: DataTableExportButtonProps<TData>) {
  const selectedRowCount = Object.keys(table.getState().rowSelection).length;
  const hasSelection = selectedRowCount > 0;

  return (
    <Button
      variant="outline"
      className="font-normal"
      size="sm"
      disabled={table.getRowCount() === 0}
      onClick={() =>
        exportTableToCSV(table, {
          filename,
          excludeColumns,
          onlySelected: hasSelection,
        })
      }
    >
      <Download />
      {hasSelection ? (
        <>
          Export Selected
          <div className="text-xs -ml-1">{`(${selectedRowCount})`}</div>
        </>
      ) : (
        "Export All"
      )}
    </Button>
  );
}

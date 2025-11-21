import { Button } from "@/components/ui/button";

interface DataTableErrorProps {
  error?: Error | null;
  onRetry: () => void;
}

export function DataTableError({ error, onRetry }: DataTableErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <div className="text-center">
        <h3 className="font-semibold text-lg">Failed to load data</h3>
        <p className="text-muted-foreground text-sm">{error?.message || "Something went wrong"}</p>
      </div>
      <Button onClick={onRetry}>Try Again</Button>
    </div>
  );
}

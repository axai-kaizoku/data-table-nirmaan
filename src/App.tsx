import { useQuery } from "@tanstack/react-query";
import { getData } from "./api/getData";
import { DataTable } from "./table/data-table";

export default function App() {
  const { data, isLoading } = useQuery({
    queryKey: ["tracks-data"],
    queryFn: () => getData(),
  });
  console.log(data);
  return (
    <div className="container mx-auto py-10">{isLoading ? <DataTableSkeleton /> : <DataTable data={data ?? []} />}</div>
  );
}

function DataTableSkeleton() {
  return <div>Loading..</div>;
}

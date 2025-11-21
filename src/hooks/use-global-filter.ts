import { useState } from "react";
import { useDebounce } from "./use-debounce";

export const useGlobalFilter = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const searchTerm = useDebounce(globalFilter, 300);

  return { globalFilter, searchTerm, setGlobalFilter };
};

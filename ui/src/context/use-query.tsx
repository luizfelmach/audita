import { useQuery } from "@/hooks/use-query";
import { createContext, useContext } from "react";

const QueryContext = createContext<ReturnType<typeof useQuery> | null>(null);

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  const query = useQuery();
  return (
    <QueryContext.Provider value={query}>{children}</QueryContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useQueryContext() {
  const context = useContext(QueryContext);
  if (!context) {
    throw new Error("useQueryContext must be used within a QueryProvider");
  }
  return context;
}

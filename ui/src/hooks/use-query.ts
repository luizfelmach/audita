import * as React from "react";
import { Condition, Query } from "@/types/search";

export function useQuery() {
  const [query, setQuery] = React.useState<Query>({});

  const addCondition = React.useCallback(
    (clause: "and" | "or" | "not", condition: Condition) => {
      setQuery((prev) => {
        const updatedClause = prev[clause]
          ? [...prev[clause]!, condition]
          : [condition];
        return {
          ...prev,
          [clause]: updatedClause,
        };
      });
    },
    [],
  );

  const removeCondition = React.useCallback(
    (clause: "and" | "or" | "not", index: number) => {
      setQuery((prev) => {
        if (!prev[clause]) return prev;
        const updatedClause = [...prev[clause]!];
        updatedClause.splice(index, 1);
        return {
          ...prev,
          [clause]: updatedClause.length > 0 ? updatedClause : undefined,
        };
      });
    },
    [],
  );
  const updateCondition = React.useCallback(
    (clause: "and" | "or" | "not", index: number, newCondition: Condition) => {
      setQuery((prev) => {
        const current = prev[clause];
        if (!current || index < 0 || index >= current.length) return prev;
        const updatedClause = [...current];
        updatedClause[index] = newCondition;
        return {
          ...prev,
          [clause]: updatedClause,
        };
      });
    },
    [],
  );

  const clearQuery = React.useCallback(() => {
    setQuery({});
  }, []);

  return {
    query,
    addCondition,
    removeCondition,
    updateCondition,
    clearQuery,
  };
}

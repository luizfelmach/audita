import * as React from "react";
import type { OperatorType } from "@/types/entities";

export interface ConditionHook {
  field: string;
  type: OperatorType;
  value1: string;
  value2: string;
}

export function useConditions() {
  const [conditions, setConditions] = React.useState<ConditionHook[]>([]);

  function addCondition(condition: ConditionHook) {
    setConditions((prev) => [...prev, condition]);
  }

  function updateCondition(index: number, updated: Partial<ConditionHook>) {
    setConditions((prev) =>
      prev.map((cond, i) => (i === index ? { ...cond, ...updated } : cond)),
    );
  }

  function removeCondition(index: number) {
    setConditions((prev) => prev.filter((_, i) => i !== index));
  }

  function clearConditions() {
    setConditions([]);
  }

  return {
    conditions,
    addCondition,
    updateCondition,
    removeCondition,
    clearConditions,
  };
}

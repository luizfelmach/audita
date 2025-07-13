import type { ConditionHook } from "@/hooks/condition";
import type { Condition, Operator } from "@/types/entities";

export function convertToConditions(hooks: ConditionHook[]): Condition[] {
  return hooks.map((hook): Condition => {
    let value: Operator["value"];

    switch (hook.type) {
      case "BetweenDate":
        value = [
          new Date(hook.value1).toISOString(),
          new Date(hook.value2).toISOString(),
        ];
        break;

      case "BetweenInt":
        value = [Number(hook.value1), Number(hook.value2)];
        break;

      case "EqDate":
      case "NeqDate":
      case "AfterDate":
      case "BeforeDate":
        value = new Date(hook.value1).toISOString();
        break;

      case "EqInt":
      case "NeqInt":
      case "GtInt":
      case "LtInt":
        value = Number(hook.value1);
        break;

      case "EqString":
      case "NeqString":
      case "Contains":
      case "StartsWith":
      case "EndsWith":
      case "Regex":
        value = hook.value1;
        break;

      default:
        throw new Error(`Unsupported operator type: ${hook.type}`);
    }

    return {
      field: hook.field,
      op: {
        type: hook.type,
        value,
      },
    };
  });
}

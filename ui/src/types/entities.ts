export interface Document {
  id: string;
  source: Record<string, unknown>;
}

export type OperatorType =
  | "EqString"
  | "NeqString"
  | "Contains"
  | "StartsWith"
  | "EndsWith"
  | "Regex"
  | "EqInt"
  | "NeqInt"
  | "GtInt"
  | "LtInt"
  | "BetweenInt"
  | "EqDate"
  | "NeqDate"
  | "AfterDate"
  | "BeforeDate"
  | "BetweenDate";

export interface Operator {
  type: OperatorType;
  value: string | number | [number, number] | [string, string];
}

export interface Condition {
  field: string;
  op: Operator;
}

export interface Query {
  and?: Condition[];
  or?: Condition[];
  not?: Condition[];
}

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
  value: string | [number, number] | [string, string];
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

export interface DocumentQuery {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  source: Record<string, any>;
}

export type QueryResult = DocumentQuery[];

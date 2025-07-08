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
  | "BetweenDate"

export interface Operator {
  type: OperatorType
  value: string | [number, number] | [string, string]
}

export interface Condition {
  field: string
  op: Operator
}

export interface Query {
  and?: Condition[]
  or?: Condition[]
  not?: Condition[]
}

export interface DocumentQuery {
  id: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  source: Record<string, any>
}

export type QueryResult = DocumentQuery[]

// Popes case types
export interface FirewallDocument {
  "@timestamp": string
  cisco: {
    asa: {
      tag: string
    }
  }
  dst_ip: string
  dst_mapped_ip: string
  dst_mapped_port: string
  dst_port: string
  log: {
    syslog: {
      priority: number
    }
  }
  src_ip: string
  src_mapped_ip: string
  src_mapped_port: string
  src_port: string
  timestamp: string
  type: string
}

export interface DHCPDocument {
  "@timestamp": string
  ip: string
  lease_time: string
  mac: string
  syslog_timestamp: string
  type: string
}

export interface RADIUSDocument {
  "@timestamp": string
  mac: string
  type: string
  username: string
}

export interface PopesSearchParams {
  dst_mapped_ip: string
  dst_mapped_port: string
  timestamp: string
}

import type { DocumentQuery, Query, QueryResult } from "@/types/search";
import type {
  PopesSearchParams,
  FirewallDocument,
  DHCPDocument,
  RADIUSDocument,
} from "@/types/search";

const BASE_URL = import.meta.env.AUDITA_URL ?? "";

export async function searchDocuments(query: Query): Promise<QueryResult> {
  const url = `${BASE_URL}/api/storage/search`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`Failed to find documents: ${response.statusText}`);
  }

  const data = (await response.json()) as { docs: QueryResult };
  return data.docs;
}

export async function verifyHashStorage(index: string): Promise<string | null> {
  const url = `${BASE_URL}/api/storage/hash/${index}`;
  const response = await fetch(url);
  if (!response.ok) {
    return null;
  }
  const data = await response.json();
  if (!data.hash) return null;
  return data.hash;
}

export async function verifyHashSigner(index: string): Promise<string | null> {
  const url = `${BASE_URL}/api/signer/hash/${index}`;
  const response = await fetch(url);
  if (!response.ok) {
    return null;
  }
  const data = await response.json();
  if (!data.hash) return null;
  return data.hash;
}

export async function searchFirewallLogs(
  params: PopesSearchParams,
): Promise<FirewallDocument[]> {
  const url = `${BASE_URL}/api/storage/search`;

  // Create date range (±10 minutes)
  const baseDate = new Date(params.timestamp);
  const startDate = new Date(baseDate.getTime() - 10 * 60 * 1000);
  const endDate = new Date(baseDate.getTime() + 10 * 60 * 1000);

  const query = {
    and: [
      {
        field: "dst_mapped_ip",
        op: { type: "EqString", value: params.dst_mapped_ip },
      },
      {
        field: "dst_mapped_port",
        op: { type: "EqString", value: params.dst_mapped_port },
      },
      {
        field: "@timestamp",
        op: {
          type: "BetweenDate",
          value: [startDate.toISOString(), endDate.toISOString()],
        },
      },
      {
        field: "type",
        op: { type: "EqString", value: "fw" },
      },
    ],
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`Failed to search firewall logs: ${response.statusText}`);
  }

  const data = await response.json();
  return data.docs.map((doc: DocumentQuery) => ({ id: doc.id, ...doc.source }));
}

export async function searchDHCPLogs(
  dst_ip: string,
  _dst_port: string,
): Promise<DHCPDocument[]> {
  const url = `${BASE_URL}/api/storage/search`;

  const query = {
    and: [
      {
        field: "ip",
        op: { type: "EqString", value: dst_ip },
      },
      {
        field: "type",
        op: { type: "EqString", value: "dhcp" },
      },
    ],
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`Failed to search DHCP logs: ${response.statusText}`);
  }

  const data = await response.json();
  return data.docs.map((doc: any) => ({ id: doc.id, ...doc.source }));
}

export async function searchRADIUSLogs(mac: string): Promise<RADIUSDocument[]> {
  const url = `${BASE_URL}/api/storage/search`;

  const query = {
    and: [
      {
        field: "mac",
        op: { type: "EqString", value: mac.replace(/:/g, "-") },
      },
      {
        field: "type",
        op: { type: "EqString", value: "radius" },
      },
    ],
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`Failed to search RADIUS logs: ${response.statusText}`);
  }

  const data = await response.json();
  return data.docs.map((doc: any) => ({ id: doc.id, ...doc.source }));
}

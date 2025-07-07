import { Query, QueryResult } from "@/types/search";

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

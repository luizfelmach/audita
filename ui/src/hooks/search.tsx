import api from "@/services/api";
import type { Document, Query } from "@/types/entities";
import { useMutation } from "@tanstack/react-query";

interface SearchStorageResult {
  docs: Document[];
}

interface SearchStorageParams {
  query: Query;
}

export async function fetchSearch(payload: SearchStorageParams) {
  const response = await api.post<SearchStorageResult>(
    `/storage/search`,
    payload,
  );
  return response.data;
}

export function useSearch() {
  const mutation = useMutation({
    mutationFn: fetchSearch,
  });

  return {
    search: mutation.mutate,
    ...mutation,
  };
}

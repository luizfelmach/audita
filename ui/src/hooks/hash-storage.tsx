import api from "@/services/api";
import { useQuery } from "@tanstack/react-query";

interface HashStorageResult {
  id: string;
  hash: string;
}

export async function fetchHashStorage(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 4000));
  const response = await api.get<HashStorageResult>(`/storage/hash/${id}`);
  return response.data;
}

export function useHashStorage(id: string) {
  const { data, isLoading } = useQuery({
    queryKey: ["hashStorage", id],
    queryFn: () => fetchHashStorage(id),
  });

  return {
    hashStorage: data?.hash,
    hashStorageLoading: isLoading,
  };
}

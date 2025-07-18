import api from "@/services/api";
import { useQuery } from "@tanstack/react-query";

interface HashSignerResult {
  id: string;
  hash: string;
}

export async function fetchHashSigner(id: string) {
  const response = await api.get<HashSignerResult>(`/signer/hash/${id}`);
  return response.data;
}

export function useHashSigner(id: string) {
  const { data, isLoading } = useQuery({
    queryKey: ["hashSigner", id],
    queryFn: () => fetchHashSigner(id),
    retry: false,
  });

  return {
    hashSigner: data?.hash,
    hashSignerLoading: isLoading,
  };
}

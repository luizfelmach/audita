import api from "@/services/api";
import { useQuery } from "@tanstack/react-query";

interface HashSignerResult {
  id: string;
  hash: string;
}

export async function fetchHashSigner(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 7000));
  const response = await api.get<HashSignerResult>(`/signer/hash/${id}`);
  return response.data;
}

export function useHashSigner(id: string) {
  const { data, isLoading } = useQuery({
    queryKey: ["hashSigner", id],
    queryFn: () => fetchHashSigner(id),
  });

  return {
    hashSigner: data?.hash,
    hashSignerLoading: isLoading,
  };
}

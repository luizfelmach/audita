import { useHashSigner } from "@/hooks/hash-signer";
import { useHashStorage } from "@/hooks/hash-storage";

interface SearchResultProps {
  id: string;
  source: Record<string, any>;
}

export function SearchResult({ id, source }: SearchResultProps) {
  const { hashSigner } = useHashSigner(id);
  const { hashStorage } = useHashStorage(id);

  const isHashRegistered = hashSigner && hashStorage;
  const isAuthentic = isHashRegistered && hashSigner === hashStorage;

  function getStatus() {
    if (!isHashRegistered) return "Não registrado";
    return isAuthentic ? "Autêntico" : "Não autêntico";
  }

  return (
    <div>
      <div>
        <h1>Batch ID: {id}</h1>
        <p>{getStatus()}</p>
      </div>
      <div>{JSON.stringify(source, null, 2)}</div>
    </div>
  );
}

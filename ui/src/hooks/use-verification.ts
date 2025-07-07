import { useEffect, useState } from "react";
import { QueryResult } from "@/types/search";
import { verifyHashSigner, verifyHashStorage } from "@/services/api";

export type QueryResultVerificationItem = {
  hashSigner: string | null;
  hashStorage: string | null;
  hashSignerLoading: boolean;
  hashStorageLoading: boolean;
};

export type QueryResultVerification = (QueryResult[number] &
  QueryResultVerificationItem)[];

export function useVerification(results: QueryResult): QueryResultVerification {
  const [verifications, setVerifications] = useState<QueryResultVerification>(
    results.map((doc) => ({
      ...doc,
      hashSigner: null,
      hashStorage: null,
      hashSignerLoading: true,
      hashStorageLoading: true,
    })),
  );

  useEffect(() => {
    let cancelled = false;

    async function verifyAll() {
      const promises = results.map(async (doc) => {
        try {
          const [signer, storage] = await Promise.all([
            verifyHashSigner(doc.id),
            verifyHashStorage(doc.id),
          ]);
          return {
            ...doc,
            hashSigner: signer,
            hashStorage: storage,
            hashSignerLoading: false,
            hashStorageLoading: false,
          };
        } catch {
          return {
            ...doc,
            hashSigner: null,
            hashStorage: null,
            hashSignerLoading: false,
            hashStorageLoading: false,
          };
        }
      });

      const verified = await Promise.all(promises);
      if (!cancelled) {
        setVerifications(verified);
      }
    }

    setVerifications(
      results.map((doc) => ({
        ...doc,
        hashSigner: null,
        hashStorage: null,
        hashSignerLoading: true,
        hashStorageLoading: true,
      })),
    );

    verifyAll();

    return () => {
      cancelled = true;
    };
  }, [results]);

  return verifications;
}

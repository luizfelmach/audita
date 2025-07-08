import { useEffect, useState } from "react";
import { verifyHashSigner, verifyHashStorage } from "@/services/api";
import { FirewallDocument, DHCPDocument, RADIUSDocument } from "@/types/search";

export type VerifiedFirewallDocument = (FirewallDocument & { id: string }) & {
  hashSigner: string | null;
  hashStorage: string | null;
  hashSignerLoading: boolean;
  hashStorageLoading: boolean;
};

export type VerifiedDHCPDocument = (DHCPDocument & { id: string }) & {
  hashSigner: string | null;
  hashStorage: string | null;
  hashSignerLoading: boolean;
  hashStorageLoading: boolean;
};

export type VerifiedRADIUSDocument = (RADIUSDocument & { id: string }) & {
  hashSigner: string | null;
  hashStorage: string | null;
  hashSignerLoading: boolean;
  hashStorageLoading: boolean;
};

export function useFirewallVerification(
  results: (FirewallDocument & { id: string })[],
): VerifiedFirewallDocument[] {
  const [verifications, setVerifications] = useState<
    VerifiedFirewallDocument[]
  >(
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

export function useDHCPVerification(
  results: (DHCPDocument & { id: string })[],
): VerifiedDHCPDocument[] {
  const [verifications, setVerifications] = useState<VerifiedDHCPDocument[]>(
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

export function useRADIUSVerification(
  results: (RADIUSDocument & { id: string })[],
): VerifiedRADIUSDocument[] {
  const [verifications, setVerifications] = useState<VerifiedRADIUSDocument[]>(
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

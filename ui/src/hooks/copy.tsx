import * as React from "react";

export function useCopy() {
  const [copied, setCopied] = React.useState(false);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Erro ao copiar:", err);
      setCopied(false);
    }
  }

  return { copied, copy };
}

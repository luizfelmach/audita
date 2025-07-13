import * as React from "react";
import {
  Hash,
  Database,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Package,
} from "lucide-react";

import { useHashSigner } from "@/hooks/hash-signer";
import { useHashStorage } from "@/hooks/hash-storage";
import { useCopy } from "@/hooks/copy";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

interface SearchResultProps {
  id: string;
  source: Record<string, unknown>;
}

export function SearchResult({ id, source }: SearchResultProps) {
  const { hashSigner, hashSignerLoading } = useHashSigner(id);
  const { hashStorage, hashStorageLoading } = useHashStorage(id);

  const { copied: copiedId, copy: copyId } = useCopy();
  const { copied: copiedSource, copy: copySource } = useCopy();
  const { copied: copiedHashSigner, copy: copyHashSigner } = useCopy();
  const { copied: copiedHashStorage, copy: copyHashStorage } = useCopy();

  const [expanded, setExpanded] = React.useState(false);

  const isHashRegistered = !!(hashSigner && hashStorage);
  const isAuthentic = isHashRegistered && hashSigner === hashStorage;
  const isLoading = hashSignerLoading || hashStorageLoading;

  // Get preview of source data
  const sourceEntries = Object.entries(source);
  const visibleFields = sourceEntries.slice(0, 3);
  const remainingCount = Math.max(0, sourceEntries.length - 3);

  const CopyButton = ({
    onClick,
    copied,
  }: {
    onClick: () => void;
    copied?: boolean;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-6 w-6 p-0 hover:bg-muted/50 transition-colors"
      onClick={onClick}
    >
      {copied ? (
        <Check className="w-3 h-3 text-green-600" />
      ) : (
        <Copy className="w-3 h-3 text-muted-foreground" />
      )}
    </Button>
  );

  const formatValue = (value: unknown): string => {
    if (typeof value === "object" && value !== null) {
      return "Object";
    }
    return String(value);
  };

  const truncate = (hash: string, length = 8) => {
    return `${hash.slice(0, length)}...${hash.slice(-4)}`;
  };

  return (
    <Card className="border border-border/50 hover:border-border transition-colors shadow-none">
      <CardContent className="p-4 space-y-4">
        {/* Batch ID Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="size-4 text-primary" />
            <span className="text-sm font-medium">Batch ID</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="text-sm font-mono text-foreground bg-secondary/60 px-2 py-2 rounded-md">
              {truncate(id, 12)}
            </code>
            <CopyButton onClick={() => copyId(id)} copied={copiedId} />
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Badge variant="secondary" className="gap-1">
              <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
              Verifying...
            </Badge>
          ) : !hashSigner || !hashStorage ? (
            <Badge variant="secondary" className="gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              Unregistered
            </Badge>
          ) : isAuthentic ? (
            <Badge
              variant="default"
              className="gap-1 bg-green-100 text-green-800 border-green-200 hover:bg-green-100"
            >
              <Check className="w-3 h-3" />
              Authentic Document
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <div className="w-2 h-2 bg-current rounded-full" />
              Corrupted data
            </Badge>
          )}
        </div>

        {/* Hash Information */}
        <div className="grid [grid-template-columns:repeat(auto-fit,minmax(250px,1fr))] gap-3">
          {/* Signer Hash */}
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md border">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Signer
              </span>
            </div>
            {hashSignerLoading ? (
              <Skeleton className="h-4 w-20 rounded" />
            ) : hashSigner ? (
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono px-2 py-1 rounded">
                  {truncate(hashSigner, 8)}
                </code>
                <CopyButton
                  onClick={() => copyHashSigner(hashSigner)}
                  copied={copiedHashSigner}
                />
              </div>
            ) : (
              <Badge variant="outline" className="text-xs">
                N/A
              </Badge>
            )}
          </div>

          {/* Storage Hash */}
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md border">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Storage
              </span>
            </div>
            {hashStorageLoading ? (
              <Skeleton className="h-4 w-20 rounded" />
            ) : hashStorage ? (
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono px-2 py-1 rounded">
                  {truncate(hashStorage, 8)}
                </code>
                <CopyButton
                  onClick={() => copyHashStorage(hashStorage)}
                  copied={copiedHashStorage}
                />
              </div>
            ) : (
              <Badge variant="outline" className="text-xs">
                N/A
              </Badge>
            )}
          </div>
        </div>

        {/* Source Data */}
        <Collapsible open={expanded} onOpenChange={setExpanded}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Source Data
              </span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  {sourceEntries.length} fields
                </Badge>
                <CopyButton
                  onClick={() => copySource(JSON.stringify(source, null, 2))}
                  copied={copiedSource}
                />
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    {expanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>

            {/* Preview when collapsed */}
            {!expanded && (
              <div className="text-xs text-muted-foreground space-y-1">
                {visibleFields.map(([key, value]) => (
                  <div key={key} className="flex items-center gap-1">
                    <span className="font-mono">{key}:</span>
                    <span>{formatValue(value)}</span>
                  </div>
                ))}
                {remainingCount > 0 && (
                  <div className="text-muted-foreground/70">
                    + {remainingCount} more
                  </div>
                )}
              </div>
            )}

            {/* Full content when expanded */}
            <CollapsibleContent>
              <div className="mt-2 bg-muted/20 border rounded-md overflow-hidden">
                <div className="bg-muted/50 px-3 py-2 border-b">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    JSON Source
                  </span>
                </div>
                <div className="p-3 overflow-x-auto">
                  <pre className="text-xs font-mono text-foreground leading-relaxed">
                    {JSON.stringify(source, null, 2)}
                  </pre>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

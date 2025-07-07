import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Copy,
  Hash,
  Package,
  Database,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Shield,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SearchResultCardProps {
  batchId: string;
  hashSigner: string | null;
  hashSignerLoading: boolean;
  hashStorage: string | null;
  hashStorageLoading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  source: Record<string, any>;
}

export default function SearchResultCard({
  batchId,
  hashSigner,
  hashSignerLoading,
  hashStorage,
  hashStorageLoading,
  source,
}: SearchResultCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSourceExpanded, setIsSourceExpanded] = useState(false);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const truncateHash = (hash: string, length = 12) => {
    if (hash.length <= length) return hash;
    return `${hash.slice(0, length)}...${hash.slice(-4)}`;
  };

  const getStatusConfig = () => {
    if (hashSignerLoading || hashStorageLoading) {
      return {
        label: "N/A",
        variant: "default" as const,
        className: "bg-gray-100 text-gray-800 border-gray-200",
        icon: Shield,
      };
    }
    if (!hashSigner || !hashStorage) {
      return {
        label: "Unregistered",
        variant: "secondary" as const,
        className: "bg-gray-100 text-gray-800 border-gray-200",
        icon: XCircle,
      };
    }

    if (hashSigner === hashStorage) {
      return {
        label: "Authentic Document",
        variant: "default" as const,
        className: "bg-green-100 text-green-800 border-green-200",
        icon: Shield,
      };
    }

    return {
      label: "Compromised",
      variant: "destructive" as const,
      className: "bg-red-100 text-red-800 border-red-200",
      icon: AlertTriangle,
    };
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <Card className={cn("transition-shadow duration-200 shadow-none")}>
      <CardContent className="p-4">
        {/* Header with Batch ID and Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-muted-foreground">
                Batch ID
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <code className="text-sm bg-slate-100 px-2 py-1 rounded font-mono text-slate-700">
              {truncateHash(batchId, 8)}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(batchId, "batchId")}
              className="h-7 w-7 p-0 hover:bg-slate-100"
            >
              {copiedField === "batchId" ? (
                <CheckCircle2 className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
        <Badge className={statusConfig.className}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {statusConfig.label}
        </Badge>

        {/* Hash Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 mt-3">
          {/* Hash Signer */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 min-w-0">
              <Hash className="h-3 w-3 text-slate-500 flex-shrink-0" />
              <span className="text-xs font-medium text-slate-600">Signer</span>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              {hashSignerLoading ? (
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-16 rounded" />
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              ) : hashSigner ? (
                <>
                  <code className="text-xs bg-white px-2 py-1 rounded font-mono text-slate-700 truncate max-w-24">
                    {truncateHash(hashSigner, 8)}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(hashSigner, "hashSigner")}
                    className="h-6 w-6 p-0 hover:bg-slate-200"
                  >
                    {copiedField === "hashSigner" ? (
                      <CheckCircle2 className="h-2.5 w-2.5 text-green-600" />
                    ) : (
                      <Copy className="h-2.5 w-2.5" />
                    )}
                  </Button>
                </>
              ) : (
                <Badge variant="outline" className="text-xs py-0 px-2 h-5">
                  N/A
                </Badge>
              )}
            </div>
          </div>

          {/* Hash Storage */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 min-w-0">
              <Database className="h-3 w-3 text-slate-500 flex-shrink-0" />
              <span className="text-xs font-medium text-slate-600">
                Storage
              </span>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              {hashStorageLoading ? (
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-16 rounded" />
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              ) : hashStorage ? (
                <>
                  <code className="text-xs bg-white px-2 py-1 rounded font-mono text-slate-700 truncate max-w-24">
                    {truncateHash(hashStorage, 8)}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(hashStorage, "hashStorage")}
                    className="h-6 w-6 p-0 hover:bg-slate-200"
                  >
                    {copiedField === "hashStorage" ? (
                      <CheckCircle2 className="h-2.5 w-2.5 text-green-600" />
                    ) : (
                      <Copy className="h-2.5 w-2.5" />
                    )}
                  </Button>
                </>
              ) : (
                <Badge variant="outline" className="text-xs py-0 px-2 h-5">
                  N/A
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Source Data Section */}
        <div className="border-t pt-3">
          <Collapsible
            open={isSourceExpanded}
            onOpenChange={setIsSourceExpanded}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">
                Source Data
              </span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs py-0 px-2 h-5">
                  {Object.keys(source).length} fields
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(JSON.stringify(source, null, 2), "source")
                  }
                  className="h-6 w-6 p-0 hover:bg-slate-100"
                >
                  {copiedField === "source" ? (
                    <CheckCircle2 className="h-2.5 w-2.5 text-green-600" />
                  ) : (
                    <Copy className="h-2.5 w-2.5" />
                  )}
                </Button>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-slate-100"
                  >
                    {isSourceExpanded ? (
                      <ChevronUp className="h-2.5 w-2.5" />
                    ) : (
                      <ChevronDown className="h-2.5 w-2.5" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>

            {!isSourceExpanded && (
              <div className="mt-2 flex flex-wrap gap-1">
                {Object.entries(source)
                  .slice(0, 3)
                  .map(([key, value]) => (
                    <div key={key} className="text-xs text-slate-500">
                      <span className="font-medium">{key}:</span>{" "}
                      <span className="text-slate-700">
                        {typeof value === "string" && value.length > 15
                          ? `${value.slice(0, 15)}...`
                          : typeof value === "object"
                            ? "Object"
                            : String(value)}
                      </span>
                    </div>
                  ))}
                {Object.keys(source).length > 3 && (
                  <span className="text-xs text-slate-400">
                    +{Object.keys(source).length - 3} more
                  </span>
                )}
              </div>
            )}

            <CollapsibleContent className="mt-3">
              <div className="bg-slate-900 rounded-lg p-3 overflow-x-auto">
                <pre className="text-xs text-slate-100 whitespace-pre-wrap">
                  {JSON.stringify(source, null, 2)}
                </pre>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
}

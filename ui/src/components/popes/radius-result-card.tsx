import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Copy,
  CheckCircle2,
  Shield,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  User,
  Clock,
} from "lucide-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { RADIUSDocument } from "@/types/search";

interface RADIUSResultCardProps {
  document: RADIUSDocument & { id: string };
  hashSigner: string | null;
  hashSignerLoading: boolean;
  hashStorage: string | null;
  hashStorageLoading: boolean;
}

export function RADIUSResultCard({
  document,
  hashSigner,
  hashSignerLoading,
  hashStorage,
  hashStorageLoading,
}: RADIUSResultCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
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
    <Card className="transition-shadow duration-200 shadow-none">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-muted-foreground">
              RADIUS Log
            </span>
          </div>
          <Badge className={statusConfig.className}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusConfig.label}
          </Badge>
        </div>

        {/* User Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-600">Username</div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-sm font-mono">
                {document.username || "N/A"}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-600">MAC Address</div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-sm font-mono">{document.mac}</div>
            </div>
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-2 mb-4 p-3 bg-slate-50 rounded-lg">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-600">Timestamp:</span>
          <span className="text-sm font-mono">{document["@timestamp"]}</span>
        </div>

        {/* Hash Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-xs font-medium text-slate-600">Signer</span>
            <div className="flex items-center gap-2">
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
                  <code className="text-xs bg-white px-2 py-1 rounded font-mono text-slate-700">
                    {hashSigner.slice(0, 8)}...
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(hashSigner, "hashSigner")}
                    className="h-6 w-6 p-0"
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

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-xs font-medium text-slate-600">Storage</span>
            <div className="flex items-center gap-2">
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
                  <code className="text-xs bg-white px-2 py-1 rounded font-mono text-slate-700">
                    {hashStorage.slice(0, 8)}...
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(hashStorage, "hashStorage")}
                    className="h-6 w-6 p-0"
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

        {/* Full Document */}
        <div className="border-t pt-3">
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">
                Full Document
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      JSON.stringify(document, null, 2),
                      "document",
                    )
                  }
                  className="h-6 w-6 p-0"
                >
                  {copiedField === "document" ? (
                    <CheckCircle2 className="h-2.5 w-2.5 text-green-600" />
                  ) : (
                    <Copy className="h-2.5 w-2.5" />
                  )}
                </Button>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    {isExpanded ? (
                      <ChevronUp className="h-2.5 w-2.5" />
                    ) : (
                      <ChevronDown className="h-2.5 w-2.5" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>

            <CollapsibleContent className="mt-3">
              <div className="bg-slate-900 rounded-lg p-3 overflow-x-auto">
                <pre className="text-xs text-slate-100 whitespace-pre-wrap">
                  {JSON.stringify(document, null, 2)}
                </pre>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
}

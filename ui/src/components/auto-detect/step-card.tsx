
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useHashSigner } from "@/hooks/hash-signer";
import { useHashStorage } from "@/hooks/hash-storage";
import { useCopy } from "@/hooks/copy";
import {
  CheckCircle,
  XCircle,
  Clock,
  SkipForward,
  Hash,
  Database,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StepCardProps {
  id?: string;
  title: string;
  icon: LucideIcon;
  data: Record<string, any> | null;
  status: "completed" | "failed" | "pending" | "skipped";
  fields: { key: string; label: string }[];
}

const CopyButton = ({ onClick, copied }: { onClick: () => void; copied?: boolean; }) => (
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

const truncate = (hash: string, length = 8) => {
  if (!hash) return "";
  return `${hash.slice(0, length)}...${hash.slice(-4)}`;
};

export function StepCard({ id, title, icon: Icon, data, status, fields }: StepCardProps) {
  const { hashSigner, hashSignerLoading } = useHashSigner(id as string);
  const { hashStorage, hashStorageLoading } = useHashStorage(id as string);

  const { copied: copiedSource, copy: copySource } = useCopy();
  const { copied: copiedHashSigner, copy: copyHashSigner } = useCopy();
  const { copied: copiedHashStorage, copy: copyHashStorage } = useCopy();

  const [expanded, setExpanded] = React.useState(false);

  const isHashRegistered = !!(hashSigner && hashStorage);
  const isAuthentic = isHashRegistered && hashSigner === hashStorage;
  const isLoadingHashes = hashSignerLoading || hashStorageLoading;

  const getStatusConfig = () => {
    // ... (same as before)
    switch (status) {
      case "completed":
        return {
          card: "border-green-200 bg-green-50/50",
          iconColor: "text-green-600",
          badge: "bg-green-100 text-green-800 border-green-200",
          badgeIcon: <CheckCircle className="w-4 h-4 mr-1" />,
          badgeText: "Found",
          message: "",
        };
      case "failed":
        return {
          card: "border-red-200 bg-red-50/50",
          iconColor: "text-red-600",
          badge: "bg-red-100 text-red-800 border-red-200",
          badgeIcon: <XCircle className="w-4 h-4 mr-1" />,
          badgeText: "Not Found",
          message: "Execution failed or no data returned.",
        };
      case "skipped":
        return {
          card: "border-gray-200 bg-gray-50/50 opacity-60",
          iconColor: "text-gray-400",
          badge: "bg-gray-100 text-gray-500 border-gray-200",
          badgeIcon: <SkipForward className="w-4 h-4 mr-1" />,
          badgeText: "Skipped",
          message: "Skipped due to previous step failure.",
        };
      case "pending":
      default:
        return {
          card: "border-gray-200 bg-gray-50/50 opacity-70",
          iconColor: "text-gray-500",
          badge: "bg-gray-100 text-gray-600 border-gray-200",
          badgeIcon: <Clock className="w-4 h-4 mr-1" />,
          badgeText: "Pending",
          message: "Waiting for previous step to complete.",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Card className={cn("w-full flex flex-col", config.card)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className={cn("w-6 h-6", config.iconColor)} />
            <CardTitle className="text-base font-medium">{title}</CardTitle>
          </div>
          <Badge variant="outline" className={config.badge}>
            {config.badgeIcon}
            {config.badgeText}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm flex-grow">
        {status === "completed" && data ? (
          <div className="space-y-3">
            <div className="space-y-2">
              {fields.map((field) => (
                <div key={field.key} className="flex justify-between items-center">
                  <span className="text-muted-foreground text-xs">{field.label}</span>
                  <span className="font-mono text-xs bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
                    {data[field.key] || "N/A"}
                  </span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="space-y-2">
                {isLoadingHashes ? (
                    <Badge variant="secondary" className="gap-1 w-full justify-center"><div className="w-2 h-2 bg-current rounded-full animate-pulse" />Verifying...</Badge>
                ) : !hashSigner || !hashStorage ? (
                    <Badge variant="secondary" className="gap-1 w-full justify-center"><div className="w-2 h-2 bg-yellow-500 rounded-full" />Unregistered</Badge>
                ) : isAuthentic ? (
                    <Badge variant="default" className="gap-1 bg-green-100 text-green-800 border-green-200 hover:bg-green-100 w-full justify-center"><Check className="w-3 h-3" />Authentic</Badge>
                ) : (
                    <Badge variant="destructive" className="gap-1 w-full justify-center"><div className="w-2 h-2 bg-current rounded-full" />Corrupted</Badge>
                )}
                <div className="flex items-center justify-between p-2 bg-muted/30 rounded-md border">
                    <div className="flex items-center gap-2"><Hash className="w-4 h-4 text-muted-foreground" /><span className="text-xs font-medium text-muted-foreground">Signer</span></div>
                    {hashSignerLoading ? <Skeleton className="h-4 w-20 rounded" /> : hashSigner ? (
                        <div className="flex items-center gap-2"><code className="text-xs font-mono">{truncate(hashSigner)}</code><CopyButton onClick={() => copyHashSigner(hashSigner)} copied={copiedHashSigner} /></div>
                    ) : <Badge variant="outline" className="text-xs">N/A</Badge>}
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/30 rounded-md border">
                    <div className="flex items-center gap-2"><Database className="w-4 h-4 text-muted-foreground" /><span className="text-xs font-medium text-muted-foreground">Storage</span></div>
                    {hashStorageLoading ? <Skeleton className="h-4 w-20 rounded" /> : hashStorage ? (
                        <div className="flex items-center gap-2"><code className="text-xs font-mono">{truncate(hashStorage)}</code><CopyButton onClick={() => copyHashStorage(hashStorage)} copied={copiedHashStorage} /></div>
                    ) : <Badge variant="outline" className="text-xs">N/A</Badge>}
                </div>
            </div>
            <Separator />
            <Collapsible open={expanded} onOpenChange={setExpanded}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Source Data</span>
                  <div className="flex items-center gap-2">
                    <CopyButton onClick={() => copySource(JSON.stringify(data, null, 2))} copied={copiedSource} />
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
                <CollapsibleContent>
                  <div className="mt-2 bg-muted/20 border rounded-md overflow-hidden">
                    <div className="p-3 overflow-x-auto">
                      <pre className="text-xs font-mono text-foreground leading-relaxed">
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>
        ) : (
          <div className="text-center text-muted-foreground pt-4 text-xs flex items-center justify-center h-full">
            {config.message}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, Clock, SkipForward } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StepCardProps {
  title: string;
  icon: LucideIcon;
  data: Record<string, any> | null;
  status: "completed" | "failed" | "pending" | "skipped";
  fields: { key: string; label: string }[];
}

export function StepCard({ title, icon: Icon, data, status, fields }: StepCardProps) {
  const getStatusConfig = () => {
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
    <Card className={cn("w-full", config.card)}>
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
      <CardContent className="space-y-2 text-sm h-[76px]">
        {status === "completed" && data ? (
          fields.map((field) => (
            <div key={field.key} className="flex justify-between items-center">
              <span className="text-muted-foreground">{field.label}</span>
              <span className="font-mono text-xs bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
                {data[field.key] || "N/A"}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground pt-4 text-xs">
            {config.message}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

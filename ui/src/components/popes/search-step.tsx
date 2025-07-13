import { cn } from "@/lib/utils";

import type React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Wifi,
  Radio,
  CheckCircle,
  Clock,
  ArrowRight,
} from "lucide-react";

interface SearchStepProps {
  step: number;
  title: string;
  description: string;
  status: "pending" | "loading" | "completed" | "current";
  icon: React.ComponentType<{ className?: string }>;
  resultCount?: number;
}

export function SearchStep({
  step,
  title,
  description,
  status,
  icon: Icon,
  resultCount,
}: SearchStepProps) {
  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "loading":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 animate-pulse";
      case "current":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "loading":
        return <Clock className="w-4 h-4 animate-spin" />;
      case "current":
        return <ArrowRight className="w-4 h-4" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-current" />;
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* Step Indicator */}
      <div className="flex flex-col items-center gap-2">
        <div
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors",
            status === "completed" &&
              "bg-green-100 border-green-300 text-green-700",
            status === "loading" &&
              "bg-yellow-100 border-yellow-300 text-yellow-700",
            status === "current" && "bg-blue-100 border-blue-300 text-blue-700",
            status === "pending" && "bg-gray-100 border-gray-300 text-gray-500",
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          Step {step}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1">
        <Card
          className={cn(
            "border transition-colors",
            status === "completed" && "border-green-200 bg-green-50/50",
            status === "loading" && "border-yellow-200 bg-yellow-50/50",
            status === "current" && "border-blue-200 bg-blue-50/50",
            status === "pending" && "border-gray-200 bg-gray-50/50",
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground">{title}</h3>
                  <Badge variant="outline" className={getStatusColor()}>
                    {getStatusIcon()}
                    {status === "loading" && "Searching..."}
                    {status === "completed" && `${resultCount || 0} results`}
                    {status === "current" && "Ready"}
                    {status === "pending" && "Waiting"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function SearchSteps({
  currentStep,
  firewallResults,
  dhcpResults,
  radiusResults,
  firewallLoading,
  dhcpLoading,
  radiusLoading,
}: {
  currentStep: number;
  firewallResults?: number;
  dhcpResults?: number;
  radiusResults?: number;
  firewallLoading: boolean;
  dhcpLoading: boolean;
  radiusLoading: boolean;
}) {
  const steps = [
    {
      step: 1,
      title: "Firewall Search",
      description: "Search firewall logs with IP, port and timestamp range",
      icon: Shield,
      status: firewallLoading
        ? "loading"
        : firewallResults !== undefined
          ? "completed"
          : currentStep === 1
            ? "current"
            : "pending",
      resultCount: firewallResults,
    },
    {
      step: 2,
      title: "DHCP Lookup",
      description: "Find MAC address using destination IP and port",
      icon: Wifi,
      status: dhcpLoading
        ? "loading"
        : dhcpResults !== undefined
          ? "completed"
          : currentStep === 2
            ? "current"
            : "pending",
      resultCount: dhcpResults,
    },
    {
      step: 3,
      title: "Radius Authentication",
      description: "Lookup user authentication data using MAC address",
      icon: Radio,
      status: radiusLoading
        ? "loading"
        : radiusResults !== undefined
          ? "completed"
          : currentStep === 3
            ? "current"
            : "pending",
      resultCount: radiusResults,
    },
  ] as const;

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={step.step}>
          <SearchStep {...step} />
          {index < steps.length - 1 && (
            <div className="flex justify-center py-2">
              <div className="w-px h-8 bg-border" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

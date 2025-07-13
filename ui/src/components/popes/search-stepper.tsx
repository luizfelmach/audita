import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Wifi,
  Radio,
  CheckCircle,
  Clock,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  currentStep: number;
  firewallCompleted: boolean;
  dhcpCompleted: boolean;
  radiusCompleted: boolean;
  firewallLoading: boolean;
  dhcpLoading: boolean;
  radiusLoading: boolean;
  firewallCount?: number;
  dhcpCount?: number;
  radiusCount?: number;
  firewallError?: boolean;
  dhcpError?: boolean;
  radiusError?: boolean;
}

export function SearchStepper({
  currentStep,
  firewallCompleted,
  dhcpCompleted,
  radiusCompleted,
  firewallLoading,
  dhcpLoading,
  radiusLoading,
  firewallCount = 0,
  dhcpCount = 0,
  radiusCount = 0,
  firewallError = false,
  dhcpError = false,
  radiusError = false,
}: StepperProps) {
  const steps = [
    {
      id: 1,
      title: "Firewall Search",
      description: "Search logs with IP, port & timestamp",
      icon: Shield,
      completed: firewallCompleted,
      loading: firewallLoading,
      error: firewallError,
      count: firewallCount,
      color: "red",
    },
    {
      id: 2,
      title: "DHCP Lookup",
      description: "Find MAC address using IP & port",
      icon: Wifi,
      completed: dhcpCompleted,
      loading: dhcpLoading,
      error: dhcpError,
      count: dhcpCount,
      color: "blue",
    },
    {
      id: 3,
      title: "Radius Auth",
      description: "Lookup user data with MAC address",
      icon: Radio,
      completed: radiusCompleted,
      loading: radiusLoading,
      error: radiusError,
      count: radiusCount,
      color: "green",
    },
  ];

  const getStepStatus = (step: (typeof steps)[0]) => {
    if (step.error) return "error";
    if (step.loading) return "loading";
    if (step.completed) return "completed";
    if (step.id === currentStep) return "current";
    if (step.id < currentStep) return "skipped";
    return "pending";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "loading":
        return <Clock className="w-4 h-4 text-yellow-600 animate-spin" />;
      case "current":
        return <ArrowRight className="w-4 h-4 text-blue-600" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return (
          <div className="w-4 h-4 rounded-full border-2 border-gray-400" />
        );
    }
  };

  const getStepColors = (step: (typeof steps)[0], status: string) => {
    const baseColors = {
      red: {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-800",
        badge: "bg-red-100 text-red-800 border-red-200",
      },
      blue: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-800",
        badge: "bg-blue-100 text-blue-800 border-blue-200",
      },
      green: {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-800",
        badge: "bg-green-100 text-green-800 border-green-200",
      },
    };

    const colors = baseColors[step.color as keyof typeof baseColors];

    switch (status) {
      case "completed":
        return {
          card: `${colors.bg} ${colors.border}`,
          circle: "bg-green-100 border-green-300 text-green-700",
          badge: colors.badge,
        };
      case "loading":
        return {
          card: "bg-yellow-50 border-yellow-200",
          circle: "bg-yellow-100 border-yellow-300 text-yellow-700",
          badge: "bg-yellow-100 text-yellow-800 border-yellow-200",
        };
      case "current":
        return {
          card: `${colors.bg} ${colors.border}`,
          circle: `${colors.bg} ${colors.border} ${colors.text}`,
          badge: colors.badge,
        };
      case "error":
        return {
          card: "bg-red-50 border-red-200",
          circle: "bg-red-100 border-red-300 text-red-700",
          badge: "bg-red-100 text-red-800 border-red-200",
        };
      default:
        return {
          card: "bg-gray-50 border-gray-200",
          circle: "bg-gray-100 border-gray-300 text-gray-500",
          badge: "bg-gray-100 text-gray-600 border-gray-200",
        };
    }
  };

  return (
    <Card className="border-border/50 shadow-none">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Search Progress
            </h3>
            <p className="text-sm text-muted-foreground">
              Follow the three-step process to trace network activity
            </p>
          </div>

          {/* Steps */}
          <div className="relative">
            {steps.map((step, index) => {
              const status = getStepStatus(step);
              const colors = getStepColors(step, status);
              const StepIcon = step.icon;

              return (
                <div key={step.id} className="relative">
                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-6 top-12 w-px h-16 bg-border z-0" />
                  )}

                  {/* Step Content */}
                  <div className="relative flex items-start gap-4 z-10">
                    {/* Step Circle */}
                    <div
                      className={cn(
                        "flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors shrink-0",
                        colors.circle,
                      )}
                    >
                      <StepIcon className="w-6 h-6" />
                    </div>

                    {/* Step Card */}
                    <div className="flex-1 pb-8">
                      <Card
                        className={cn("border transition-colors", colors.card)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-foreground">
                                {step.title}
                              </h4>
                              <Badge variant="outline" className={colors.badge}>
                                {getStatusIcon(status)}
                                <span className="ml-1">
                                  {status === "loading" && "Searching..."}
                                  {status === "completed" &&
                                    `${step.count} results`}
                                  {status === "current" && "Ready"}
                                  {status === "pending" && "Waiting"}
                                  {status === "error" && "Error"}
                                </span>
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {step.description}
                          </p>

                          {/* Progress Details */}
                          {status === "completed" && step.count > 0 && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              ✓ Found {step.count} record
                              {step.count !== 1 ? "s" : ""} - Ready for next
                              step
                            </div>
                          )}
                          {status === "loading" && (
                            <div className="mt-2 text-xs text-muted-foreground animate-pulse">
                              🔍 Searching database...
                            </div>
                          )}
                          {status === "error" && (
                            <div className="mt-2 text-xs text-red-600">
                              ⚠️ Search failed - Please try again
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-border">
            <Badge variant="outline" className="gap-1">
              <CheckCircle className="w-3 h-3" />
              {
                [firewallCompleted, dhcpCompleted, radiusCompleted].filter(
                  Boolean,
                ).length
              }
              /3 Completed
            </Badge>
            {firewallCount + dhcpCount + radiusCount > 0 && (
              <Badge variant="secondary">
                {firewallCount + dhcpCount + radiusCount} Total Results
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

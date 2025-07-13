import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SearchX,
  RotateCcw,
  AlertTriangle,
  Shield,
  Wifi,
  Radio,
} from "lucide-react";

interface NoResultsFoundProps {
  step: "firewall" | "dhcp" | "radius";
  searchParams?: Record<string, string>;
  onRetry?: () => void;
  onStartOver?: () => void;
}

export function NoResultsFound({
  step,
  searchParams,
  onRetry,
  onStartOver,
}: NoResultsFoundProps) {
  const getStepConfig = () => {
    switch (step) {
      case "firewall":
        return {
          icon: Shield,
          title: "No Firewall Logs Found",
          color: "bg-red-100 text-red-800 border-red-200",
          description: "No firewall logs match your search criteria",
          suggestions: [
            "Check if the destination mapped IP and port are correct",
            "Verify the timestamp is within the expected range",
            "Ensure the firewall was logging during that time period",
            "Try expanding the time range (±10 minutes is currently used)",
          ],
        };
      case "dhcp":
        return {
          icon: Wifi,
          title: "No DHCP Records Found",
          color: "bg-blue-100 text-blue-800 border-blue-200",
          description: "No DHCP records found for the selected IP address",
          suggestions: [
            "The IP might be statically assigned (not from DHCP)",
            "DHCP lease might have expired and been removed",
            "Check if the IP address is correct in the firewall log",
            "Verify DHCP server was operational during that time",
          ],
        };
      case "radius":
        return {
          icon: Radio,
          title: "No Radius Records Found",
          color: "bg-green-100 text-green-800 border-green-200",
          description: "No authentication records found for the MAC address",
          suggestions: [
            "Device might not require 802.1X authentication",
            "MAC address might be formatted differently in Radius logs",
            "Authentication might have occurred outside the search timeframe",
            "Check if Radius server was configured for this network segment",
          ],
        };
    }
  };

  const stepConfig = getStepConfig();
  const StepIcon = stepConfig.icon;

  return (
    <Card className="border-2 border-dashed border-border bg-muted/30 shadow-none">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted border border-border mb-6">
          <SearchX className="w-8 h-8 text-muted-foreground" />
        </div>

        <div className="text-center space-y-3 mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <StepIcon className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">
              {stepConfig.title}
            </h3>
          </div>
          <p className="text-muted-foreground max-w-md">
            {stepConfig.description}
          </p>
        </div>

        {/* Search Parameters */}
        {searchParams && Object.keys(searchParams).length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <span className="text-sm text-muted-foreground">
              Searched with:
            </span>
            {Object.entries(searchParams).map(([key, value]) => (
              <Badge key={key} variant="outline" className="font-mono text-xs">
                {key}: {value}
              </Badge>
            ))}
          </div>
        )}

        {/* Suggestions */}
        <Card className="border-border/50 shadow-none mb-6 max-w-2xl">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 border border-yellow-200 shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
              </div>
              <div className="space-y-3 flex-1">
                <h4 className="font-medium text-foreground">
                  Possible Reasons & Solutions
                </h4>
                <ul className="space-y-2">
                  {stepConfig.suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0 mt-2" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {onRetry && (
            <Button
              variant="outline"
              onClick={onRetry}
              className="gap-2 bg-transparent"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Search
            </Button>
          )}
          {onStartOver && (
            <Button variant="default" onClick={onStartOver} className="gap-2">
              <Shield className="w-4 h-4" />
              Start New Search
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

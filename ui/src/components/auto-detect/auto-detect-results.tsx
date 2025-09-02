
import { NoResultsFound } from "@/components/popes/no-results-found";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Shield, Wifi, Radio, ArrowRight, Loader2 } from "lucide-react";
import { StepCard } from "./step-card";

interface AutoDetectData {
  firewall: { id: string; source: Record<string, any> } | null;
  dhcp: { id: string; source: Record<string, any> } | null;
  radius: { id: string; source: Record<string, any> } | null;
}

interface AutoDetectResultsProps {
  data: AutoDetectData;
  isPending: boolean;
}

export function AutoDetectResults({ data, isPending }: AutoDetectResultsProps) {
  if (isPending) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Searching...</p>
      </div>
    );
  }

  const { firewall, dhcp, radius } = data;
  const username = radius?.source?.username;

  const getDhcpStatus = () => {
    if (!firewall) return "skipped";
    if (!dhcp) return "failed";
    return "completed";
  };

  const getRadiusStatus = () => {
    if (!firewall || !dhcp) return "skipped";
    if (!radius) return "failed";
    return "completed";
  };

  const steps = [
    {
      id: firewall?.id,
      title: "Firewall",
      icon: Shield,
      data: firewall?.source ?? null,
      status: firewall ? "completed" : "failed",
      fields: [
        { key: "dst_ip", label: "Destination IP" },
        { key: "src_ip", label: "Source IP" },
      ],
    },
    {
      id: dhcp?.id,
      title: "DHCP",
      icon: Wifi,
      data: dhcp?.source ?? null,
      status: getDhcpStatus(),
      fields: [
        { key: "ip", label: "IP Address" },
        { key: "mac", label: "MAC Address" },
      ],
    },
    {
      id: radius?.id,
      title: "Radius",
      icon: Radio,
      data: radius?.source ?? null,
      status: getRadiusStatus(),
      fields: [
        { key: "username", label: "Username" },
        { key: "mac", label: "MAC Address" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {username && (
        <Card className="border-green-200 bg-green-50/50 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-700">
              <User className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg text-green-900">User Identified</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center text-green-800 py-2">{username}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex items-start justify-center gap-4">
        {steps.map((step, index) => (
          <div key={step.title} className="flex items-center gap-4 w-full max-w-sm">
            <StepCard {...step} />
            {index < steps.length - 1 && (
              <ArrowRight className="w-6 h-6 text-gray-300 shrink-0 mt-9" />
            )}
          </div>
        ))}
      </div>

      {!firewall && !isPending && (
        <div className="pt-8">
          <NoResultsFound step="firewall" />
        </div>
      )}
    </div>
  );
}

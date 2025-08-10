import type React from "react";

import { useState } from "react";
import { SearchForm } from "@/components/popes/search-form";
import { SearchStepper } from "@/components/popes/search-stepper";
import { PopesSearchResult } from "@/components/popes/popes-search-result";
import { NoResultsFound } from "@/components/popes/no-results-found";
import {
  useFirewallSearch,
  useDhcpSearch,
  useRadiusSearch,
} from "@/hooks/popes-search";
import type { Document } from "@/types/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Wifi, Radio } from "lucide-react";

export function Popes() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFirewallDoc, setSelectedFirewallDoc] =
    useState<Document | null>(null);
  const [selectedDhcpDoc, setSelectedDhcpDoc] = useState<Document | null>(null);
  const [lastSearchParams, setLastSearchParams] = useState<any>(null);

  // Search hooks
  const firewallSearch = useFirewallSearch();
  const dhcpSearch = useDhcpSearch();
  const radiusSearch = useRadiusSearch();

  // Handle firewall search
  const handleFirewallSearch = (params: {
    dst_mapped_ip: string;
    dst_mapped_port: string;
    timestamp: string;
  }) => {
    setCurrentStep(1);
    setSelectedFirewallDoc(null);
    setSelectedDhcpDoc(null);
    setLastSearchParams(params);
    firewallSearch.reset();
    dhcpSearch.reset();
    radiusSearch.reset();

    firewallSearch.searchFirewall(params);
  };

  // Handle firewall result selection
  const handleFirewallNext = (doc: Document) => {
    setSelectedFirewallDoc(doc);
    setCurrentStep(2);

    // Apenas dst_ip será usado para buscar no DHCP
    const dst_ip = doc.source.dst_ip as string;
    const timestamp = doc.source["@timestamp"] as string;

    console.log("Firewall selected:", { dst_ip });

    if (dst_ip) {
      dhcpSearch.searchDhcp({ dst_ip, timestamp });
    }
  };

  // Handle DHCP result selection
  const handleDhcpNext = (doc: Document) => {
    setSelectedDhcpDoc(doc);
    setCurrentStep(3);

    // Extract MAC address from selected document
    const mac = doc.source.mac as string;
    const timestamp = doc.source["@timestamp"] as string;

    console.log("DHCP selected:", { mac });

    if (mac) {
      radiusSearch.searchRadius({ mac, timestamp });
    }
  };

  // Handle retry functions
  const handleRetryFirewall = () => {
    if (lastSearchParams) {
      firewallSearch.searchFirewall(lastSearchParams);
    }
  };

  const handleRetryDhcp = () => {
    if (selectedFirewallDoc) {
      const dst_ip = selectedFirewallDoc.source.dst_ip as string;
      const timestamp = selectedFirewallDoc.source["@timestamp"] as string;
      if (dst_ip) {
        dhcpSearch.searchDhcp({ dst_ip, timestamp });
      }
    }
  };

  const handleRetryRadius = () => {
    if (selectedDhcpDoc) {
      const mac = selectedDhcpDoc.source.mac as string;
      const timestamp = selectedDhcpDoc.source["@timestamp"] as string;
      if (mac) {
        radiusSearch.searchRadius({ mac, timestamp });
      }
    }
  };

  const handleStartOver = () => {
    setCurrentStep(1);
    setSelectedFirewallDoc(null);
    setSelectedDhcpDoc(null);
    setLastSearchParams(null);
    firewallSearch.reset();
    dhcpSearch.reset();
    radiusSearch.reset();
  };

  const ResultsSection = ({
    title,
    description,
    results,
    step,
    icon: Icon,
    badgeColor,
    onNext,
    nextLoading = false,
    showNext = true,
    selectedDoc,
    searchParams,
    onRetry,
  }: {
    title: string;
    description: string;
    results: Document[];
    step: "firewall" | "dhcp" | "radius";
    icon: React.ComponentType<{ className?: string }>;
    badgeColor: string;
    onNext?: (doc: Document) => void;
    nextLoading?: boolean;
    showNext?: boolean;
    selectedDoc?: Document | null;
    searchParams?: Record<string, string>;
    onRetry?: () => void;
  }) => {
    // Show no results component if search completed but no results
    if (results.length === 0) {
      return (
        <NoResultsFound
          step={step}
          searchParams={searchParams}
          onRetry={onRetry}
          onStartOver={handleStartOver}
        />
      );
    }

    return (
      <div className="space-y-4">
        {/* Header */}
        <Card className="border-border/50 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-primary" />
                {title}
              </CardTitle>
              <Badge variant="outline" className={badgeColor}>
                {results.length} result{results.length !== 1 ? "s" : ""} found
              </Badge>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-3">
            <p className="text-sm text-muted-foreground">{description}</p>
          </CardContent>
        </Card>

        {/* Results Grid */}
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
          {results.map((doc, index) => (
            <PopesSearchResult
              key={`${doc.id}-${index}`}
              id={doc.id}
              source={doc.source}
              step={step}
              onNextStep={onNext ? () => onNext(doc) : undefined}
              nextStepLoading={nextLoading}
              showNextButton={showNext && step !== "radius" && !selectedDoc}
              isSelected={selectedDoc?.id === doc.id}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Search Form */}
      <SearchForm
        onSearch={handleFirewallSearch}
        searching={firewallSearch.isPending}
      />

      {/* Search Stepper */}
      <SearchStepper
        currentStep={currentStep}
        firewallCompleted={!!firewallSearch.data?.docs.length}
        dhcpCompleted={!!dhcpSearch.data?.docs.length}
        radiusCompleted={!!radiusSearch.data?.docs.length}
        firewallLoading={firewallSearch.isPending}
        dhcpLoading={dhcpSearch.isPending}
        radiusLoading={radiusSearch.isPending}
        firewallCount={firewallSearch.data?.docs.length || 0}
        dhcpCount={dhcpSearch.data?.docs.length || 0}
        radiusCount={radiusSearch.data?.docs.length || 0}
        firewallError={!!firewallSearch.error}
        dhcpError={!!dhcpSearch.error}
        radiusError={!!radiusSearch.error}
      />

      {/* Firewall Results */}
      {firewallSearch.data && (
        <ResultsSection
          title="Firewall Results"
          description="Select a firewall log to proceed with DHCP lookup using dst_ip."
          results={firewallSearch.data.docs}
          step="firewall"
          icon={Shield}
          badgeColor="bg-red-100 text-red-800 border-red-200"
          onNext={handleFirewallNext}
          nextLoading={dhcpSearch.isPending}
          showNext={true}
          selectedDoc={selectedFirewallDoc}
          searchParams={
            lastSearchParams
              ? {
                  dst_mapped_ip: lastSearchParams.dst_mapped_ip,
                  dst_mapped_port: lastSearchParams.dst_mapped_port,
                  timestamp: new Date(
                    lastSearchParams.timestamp,
                  ).toLocaleString(),
                }
              : undefined
          }
          onRetry={handleRetryFirewall}
        />
      )}

      {/* DHCP Results */}
      {dhcpSearch.data && selectedFirewallDoc && (
        <ResultsSection
          title="DHCP Results"
          description="Select a DHCP record to proceed with Radius lookup using the MAC address."
          results={dhcpSearch.data.docs}
          step="dhcp"
          icon={Wifi}
          badgeColor="bg-blue-100 text-blue-800 border-blue-200"
          onNext={handleDhcpNext}
          nextLoading={radiusSearch.isPending}
          showNext={true}
          selectedDoc={selectedDhcpDoc}
          searchParams={{
            ip: selectedFirewallDoc.source.dst_ip as string,
          }}
          onRetry={handleRetryDhcp}
        />
      )}

      {/* Radius Results */}
      {radiusSearch.data && selectedDhcpDoc && (
        <ResultsSection
          title="Radius Results"
          description="Final authentication records for the traced network activity."
          results={radiusSearch.data.docs}
          step="radius"
          icon={Radio}
          badgeColor="bg-green-100 text-green-800 border-green-200"
          showNext={false}
          searchParams={{
            mac: (selectedDhcpDoc.source.mac as string)?.replace(/:/g, "-"),
          }}
          onRetry={handleRetryRadius}
        />
      )}

      {/* Error States */}
      {firewallSearch.error && (
        <div className="text-center text-destructive p-4 bg-destructive/5 rounded-lg border border-destructive/20">
          Error in firewall search: {firewallSearch.error.message}
        </div>
      )}
      {dhcpSearch.error && (
        <div className="text-center text-destructive p-4 bg-destructive/5 rounded-lg border border-destructive/20">
          Error in DHCP search: {dhcpSearch.error.message}
        </div>
      )}
      {radiusSearch.error && (
        <div className="text-center text-destructive p-4 bg-destructive/5 rounded-lg border border-destructive/20">
          Error in Radius search: {radiusSearch.error.message}
        </div>
      )}
    </div>
  );
}

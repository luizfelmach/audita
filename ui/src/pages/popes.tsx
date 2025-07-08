"use client";

import { useState } from "react";
import { BoxContent, BoxHeader, BoxRoot } from "@/components/box";
import { FirewallSearchForm } from "@/components/popes/firewall-search-form";
import { FirewallResultCard } from "@/components/popes/firewall-result-card";
import { DHCPResultCard } from "@/components/popes/dhcp-result-card";
import { RADIUSResultCard } from "@/components/popes/radius-result-card";
import { SearchSkeletonGrid } from "@/components/search-skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  searchFirewallLogs,
  searchDHCPLogs,
  searchRADIUSLogs,
} from "@/services/api";
import {
  useFirewallVerification,
  useDHCPVerification,
  useRADIUSVerification,
} from "@/hooks/use-popes-verification";
import type {
  PopesSearchParams,
  FirewallDocument,
  DHCPDocument,
  RADIUSDocument,
} from "@/types/search";
import {
  IconFingerprint,
  IconNetwork,
  IconWifi,
  IconUser,
  IconArrowLeft,
} from "@tabler/icons-react";

type SearchStep = "firewall" | "dhcp" | "radius";

export function Popes() {
  const [currentStep, setCurrentStep] = useState<SearchStep>("firewall");
  const [isLoading, setIsLoading] = useState(false);

  // Firewall state
  const [firewallResults, setFirewallResults] = useState<
    (FirewallDocument & { id: string })[]
  >([]);
  const [hasFirewallSearched, setHasFirewallSearched] = useState(false);

  // DHCP state
  const [dhcpResults, setDHCPResults] = useState<
    (DHCPDocument & { id: string })[]
  >([]);
  const [hasDHCPSearched, setHasDHCPSearched] = useState(false);
  const [dhcpSearchInfo, setDHCPSearchInfo] = useState<{
    ip: string;
    port: string;
  } | null>(null);

  // RADIUS state
  const [radiusResults, setRADIUSResults] = useState<
    (RADIUSDocument & { id: string })[]
  >([]);
  const [hasRADIUSSearched, setHasRADIUSSearched] = useState(false);
  const [radiusSearchInfo, setRADIUSSearchInfo] = useState<{
    mac: string;
  } | null>(null);

  // Verification hooks
  const verifiedFirewallResults = useFirewallVerification(firewallResults);
  const verifiedDHCPResults = useDHCPVerification(dhcpResults);
  const verifiedRADIUSResults = useRADIUSVerification(radiusResults);

  const handleFirewallSearch = async (params: PopesSearchParams) => {
    setIsLoading(true);
    setHasFirewallSearched(true);

    try {
      const results = await searchFirewallLogs(params);
      setFirewallResults(results as (FirewallDocument & { id: string })[]);
    } catch (error) {
      console.error("Firewall search failed:", error);
      setFirewallResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDHCPSearch = async (dst_ip: string, dst_port: string) => {
    setIsLoading(true);
    setHasDHCPSearched(true);
    setCurrentStep("dhcp");
    setDHCPSearchInfo({ ip: dst_ip, port: dst_port });

    try {
      const results = await searchDHCPLogs(dst_ip, dst_port);
      setDHCPResults(results as (DHCPDocument & { id: string })[]);
    } catch (error) {
      console.error("DHCP search failed:", error);
      setDHCPResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRADIUSSearch = async (mac: string) => {
    setIsLoading(true);
    setHasRADIUSSearched(true);
    setCurrentStep("radius");
    setRADIUSSearchInfo({ mac });

    try {
      const results = await searchRADIUSLogs(mac);
      setRADIUSResults(results as (RADIUSDocument & { id: string })[]);
    } catch (error) {
      console.error("RADIUS search failed:", error);
      setRADIUSResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToFirewall = () => {
    setCurrentStep("firewall");
    setHasDHCPSearched(false);
    setHasRADIUSSearched(false);
    setDHCPResults([]);
    setRADIUSResults([]);
    setDHCPSearchInfo(null);
    setRADIUSSearchInfo(null);
  };

  const handleBackToDHCP = () => {
    setCurrentStep("dhcp");
    setHasRADIUSSearched(false);
    setRADIUSResults([]);
    setRADIUSSearchInfo(null);
  };

  const getStepIcon = (step: SearchStep) => {
    switch (step) {
      case "firewall":
        return IconNetwork;
      case "dhcp":
        return IconWifi;
      case "radius":
        return IconUser;
    }
  };

  const getStepTitle = (step: SearchStep) => {
    switch (step) {
      case "firewall":
        return "Firewall Logs";
      case "dhcp":
        return "DHCP Logs";
      case "radius":
        return "RADIUS Logs";
    }
  };

  const getStepDescription = (step: SearchStep) => {
    switch (step) {
      case "firewall":
        return "Search for network connections by IP, port and timestamp";
      case "dhcp":
        return `Finding MAC address for IP ${dhcpSearchInfo?.ip}:${dhcpSearchInfo?.port}`;
      case "radius":
        return `Finding user authentication for MAC ${radiusSearchInfo?.mac}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <IconFingerprint className="size-5 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Popes Investigation
          </h1>
        </div>

        {/* Step indicators */}
        <div className="flex items-center space-x-2">
          {(["firewall", "dhcp", "radius"] as SearchStep[]).map(
            (step, index) => {
              const StepIcon = getStepIcon(step);
              const isActive = currentStep === step;
              const isCompleted =
                (step === "firewall" && hasFirewallSearched) ||
                (step === "dhcp" && hasDHCPSearched) ||
                (step === "radius" && hasRADIUSSearched);

              return (
                <div key={step} className="flex items-center">
                  <Badge
                    variant={
                      isActive
                        ? "default"
                        : isCompleted
                          ? "secondary"
                          : "outline"
                    }
                    className={`flex items-center gap-1 ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : isCompleted
                          ? "bg-green-100 text-green-800"
                          : ""
                    }`}
                  >
                    <StepIcon className="size-3" />
                    {step.charAt(0).toUpperCase() + step.slice(1)}
                  </Badge>
                  {index < 2 && <div className="w-8 h-px bg-gray-300 mx-2" />}
                </div>
              );
            },
          )}
        </div>
      </div>

      {/* Main content */}
      <BoxRoot>
        <BoxHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {(() => {
                const StepIcon = getStepIcon(currentStep);
                return <StepIcon className="size-4 text-blue-600" />;
              })()}
              <h2 className="text-lg font-medium text-gray-900">
                {getStepTitle(currentStep)}
              </h2>
            </div>

            {currentStep !== "firewall" && (
              <Button
                variant="outline"
                size="sm"
                onClick={
                  currentStep === "dhcp"
                    ? handleBackToFirewall
                    : handleBackToDHCP
                }
              >
                <IconArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {getStepDescription(currentStep)}
          </p>
        </BoxHeader>

        <BoxContent>
          {currentStep === "firewall" && (
            <FirewallSearchForm
              onSearch={handleFirewallSearch}
              isLoading={isLoading}
            />
          )}
        </BoxContent>
      </BoxRoot>

      {/* Results */}
      {hasFirewallSearched && currentStep === "firewall" && (
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Firewall Results
              {!isLoading && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({firewallResults.length}{" "}
                  {firewallResults.length === 1 ? "result" : "results"} found)
                </span>
              )}
            </h3>
          </div>

          {isLoading ? (
            <SearchSkeletonGrid count={4} />
          ) : verifiedFirewallResults.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {verifiedFirewallResults.map((result, index) => (
                <FirewallResultCard
                  key={index}
                  document={result}
                  hashSigner={result.hashSigner}
                  hashStorage={result.hashStorage}
                  hashSignerLoading={result.hashSignerLoading}
                  hashStorageLoading={result.hashStorageLoading}
                  onSearchDHCP={handleDHCPSearch}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <IconNetwork className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No firewall logs found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Try adjusting your search criteria with different IP, port, or
                timestamp values.
              </p>
            </div>
          )}
        </div>
      )}

      {hasDHCPSearched && currentStep === "dhcp" && (
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              DHCP Results
              {!isLoading && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({dhcpResults.length}{" "}
                  {dhcpResults.length === 1 ? "result" : "results"} found)
                </span>
              )}
            </h3>
          </div>

          {isLoading ? (
            <SearchSkeletonGrid count={4} />
          ) : verifiedDHCPResults.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {verifiedDHCPResults.map((result, index) => (
                <DHCPResultCard
                  key={index}
                  document={result}
                  hashSigner={result.hashSigner}
                  hashStorage={result.hashStorage}
                  hashSignerLoading={result.hashSignerLoading}
                  hashStorageLoading={result.hashStorageLoading}
                  onSearchRADIUS={handleRADIUSSearch}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <IconWifi className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No DHCP logs found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                No DHCP records found for IP {dhcpSearchInfo?.ip}:
                {dhcpSearchInfo?.port}.
              </p>
            </div>
          )}
        </div>
      )}

      {hasRADIUSSearched && currentStep === "radius" && (
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              RADIUS Results
              {!isLoading && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({radiusResults.length}{" "}
                  {radiusResults.length === 1 ? "result" : "results"} found)
                </span>
              )}
            </h3>
          </div>

          {isLoading ? (
            <SearchSkeletonGrid count={4} />
          ) : verifiedRADIUSResults.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {verifiedRADIUSResults.map((result, index) => (
                <RADIUSResultCard
                  key={index}
                  document={result}
                  hashSigner={result.hashSigner}
                  hashStorage={result.hashStorage}
                  hashSignerLoading={result.hashSignerLoading}
                  hashStorageLoading={result.hashStorageLoading}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <IconUser className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No RADIUS logs found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                No authentication records found for MAC {radiusSearchInfo?.mac}.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

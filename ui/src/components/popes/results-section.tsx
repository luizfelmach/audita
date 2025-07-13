import type React from "react";

import { SearchResult } from "@/components/search/search-result";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Document } from "@/types/entities";
import { ArrowRight } from "lucide-react";

interface ResultsSectionProps {
  title: string;
  description: string;
  results: Document[];
  onSelectResult?: (result: Document) => void;
  showSelectButton?: boolean;
  loading?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  badgeColor?: string;
}

export function ResultsSection({
  title,
  description,
  results,
  onSelectResult,
  showSelectButton = false,
  loading = false,
  icon: Icon,
  badgeColor = "bg-blue-100 text-blue-800 border-blue-200",
}: ResultsSectionProps) {
  if (loading) {
    return (
      <Card className="border-border/50 shadow-none">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-4 animate-pulse">
            <Icon className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Searching {title}...
          </h3>
          <p className="text-muted-foreground text-center">
            Please wait while we process your query
          </p>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return null;
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
          <div key={`${doc.id}-${index}`} className="relative">
            <SearchResult id={doc.id} source={doc.source} />

            {/* Select Button Overlay */}
            {showSelectButton && onSelectResult && (
              <div className="absolute top-4 right-4">
                <Button
                  size="sm"
                  onClick={() => onSelectResult(doc)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                >
                  <ArrowRight className="w-4 h-4 mr-1" />
                  Select
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

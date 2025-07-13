import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SearchX,
  RotateCcw,
  Lightbulb,
  Filter,
  AlertCircle,
} from "lucide-react";

interface ResultsNotFoundProps {
  searchQuery?: string;
  conditionsCount: number;
  onClearSearch: () => void;
  onModifySearch: () => void;
}

export function ResultsNotFound({
  searchQuery,
  conditionsCount,
  onClearSearch,
  onModifySearch,
}: ResultsNotFoundProps) {
  const suggestions = [
    "Check if field names match your data structure exactly",
    "Try using broader search criteria or different operators",
    "Verify that date formats are correct (YYYY-MM-DD)",
    "Consider using 'Contains' instead of 'Equals' for partial matches",
    "Remove some conditions to expand your search scope",
  ];

  return (
    <div className="space-y-6">
      {/* Main Not Found Card */}
      <Card className="border-2 border-dashed border-border bg-muted/30 shadow-none">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted border border-border mb-6">
            <SearchX className="w-8 h-8 text-muted-foreground" />
          </div>

          <div className="text-center space-y-3 mb-6">
            <h3 className="text-xl font-semibold text-foreground">
              No Results Found
            </h3>
            <p className="text-muted-foreground max-w-md">
              Your search didn't return any documents. Try adjusting your search
              criteria or check the suggestions below.
            </p>
          </div>

          {/* Search Summary */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <Badge variant="outline" className="gap-1">
              <Filter className="w-3 h-3" />
              {conditionsCount} condition{conditionsCount !== 1 ? "s" : ""}
            </Badge>
            {searchQuery && (
              <Badge variant="secondary" className="font-mono text-xs">
                {searchQuery}
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={onModifySearch}
              className="gap-2 bg-transparent"
            >
              <Filter className="w-4 h-4" />
              Modify Search
            </Button>
            <Button variant="default" onClick={onClearSearch} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Clear & Start Over
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions Card */}
      <Card className="border-border/50 shadow-none">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 border border-yellow-200 shrink-0 mt-0.5">
              <Lightbulb className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="space-y-3 flex-1">
              <h4 className="font-medium text-foreground">
                Search Suggestions
              </h4>
              <ul className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <AlertCircle className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Common Field Examples */}
      <Card className="border-border/50 shadow-none bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              Common Field Examples
            </h4>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  User Fields
                </p>
                <div className="flex flex-wrap gap-1">
                  {["username", "email", "user_id", "created_at"].map(
                    (field) => (
                      <code
                        key={field}
                        className="text-xs bg-background border border-border px-1.5 py-0.5 rounded"
                      >
                        {field}
                      </code>
                    ),
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  System Fields
                </p>
                <div className="flex flex-wrap gap-1">
                  {["status", "type", "timestamp", "version"].map((field) => (
                    <code
                      key={field}
                      className="text-xs bg-background border border-border px-1.5 py-0.5 rounded"
                    >
                      {field}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

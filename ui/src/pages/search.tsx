import { QueryBuilder } from "@/components/search/query-builder";
import { SearchResult } from "@/components/search/search-result";
import { UsageGuide } from "@/components/search/usage-guide";
import { ResultsNotFound } from "@/components/search/results-not-found";
import type { ConditionHook } from "@/hooks/condition";
import { useSearch } from "@/hooks/search";
import { convertToConditions } from "@/lib/condition";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Clock, CheckCircle } from "lucide-react";

export function Search() {
  const { search, isPending, data, error } = useSearch();
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearchConditions, setLastSearchConditions] = useState<
    ConditionHook[]
  >([]);

  const handleSearch = (conditions_hook: ConditionHook[]) => {
    const conditions = convertToConditions(conditions_hook);
    setLastSearchConditions(conditions_hook);
    setHasSearched(true);
    search({ query: { and: conditions } });
  };

  const handleClearSearch = () => {
    setHasSearched(false);
    setLastSearchConditions([]);
  };

  const handleModifySearch = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!hasSearched && !isPending) {
    return (
      <div className="space-y-10">
        <QueryBuilder searching={isPending} onSearch={handleSearch} />
        <UsageGuide />
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="space-y-10">
        <QueryBuilder searching={isPending} onSearch={handleSearch} />

        <Card className="border-border/50 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-4 animate-pulse">
              <Database className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Searching Database...
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Please wait while we process your query with{" "}
              {lastSearchConditions.length} condition
              {lastSearchConditions.length !== 1 ? "s" : ""}
            </p>
            <Badge variant="outline" className="animate-pulse">
              <Clock className="w-3 h-3 mr-1" />
              Processing...
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-10">
        <QueryBuilder searching={isPending} onSearch={handleSearch} />

        <Card className="border-destructive/50 bg-destructive/5 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 mb-4">
              <Database className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Search Error
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              An error occurred while processing your search. Please try again.
            </p>
            <Badge variant="destructive">
              Error: {error.message || "Unknown error"}
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  const results = data?.docs || [];
  const hasResults = results.length > 0;

  return (
    <div className="space-y-10">
      <QueryBuilder searching={isPending} onSearch={handleSearch} />

      {hasResults ? (
        <div className="space-y-6">
          {/* Results Header */}
          <Card className="border-border/50 shadow-none bg-green-50/50 dark:bg-green-950/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Search results
                </CardTitle>
                <Badge
                  variant="default"
                  className="bg-green-100 text-green-800 border-green-200"
                >
                  {results.length} document{results.length !== 1 ? "s" : ""}{" "}
                  found
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Found {results.length} document{results.length !== 1 ? "s" : ""}{" "}
                matching your search criteria with {lastSearchConditions.length}{" "}
                condition{lastSearchConditions.length !== 1 ? "s" : ""}.
              </p>
            </CardContent>
          </Card>

          {/* Results Grid */}
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
            {results.map((doc, index) => (
              <SearchResult
                key={`${doc.id}-${index}`}
                id={doc.id}
                source={doc.source}
              />
            ))}
          </div>
        </div>
      ) : (
        <ResultsNotFound
          conditionsCount={lastSearchConditions.length}
          onClearSearch={handleClearSearch}
          onModifySearch={handleModifySearch}
        />
      )}
    </div>
  );
}

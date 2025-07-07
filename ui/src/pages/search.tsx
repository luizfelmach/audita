"use client";

import { BoxContent, BoxFooter, BoxHeader, BoxRoot } from "@/components/box";
import { QueryBuilder } from "@/components/query-builder";
import SearchResultCard from "@/components/search-result-card";
import { SearchSkeletonGrid } from "@/components/search-skeleton";
import { Button } from "@/components/ui/button";
import { UsageGuide } from "@/components/usage-guide";
import { QueryProvider, useQueryContext } from "@/context/use-query";
import { useVerification } from "@/hooks/use-verification";
import { searchDocuments } from "@/services/api";
import type { Condition, QueryResult } from "@/types/search";
import { IconFilter, IconSearch } from "@tabler/icons-react";
import { Plus } from "lucide-react";
import { useState } from "react";

function Main() {
  const { query, addCondition } = useQueryContext();
  const [searchResults, setSearchResults] = useState<QueryResult>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const verifications = useVerification(searchResults);

  const handleAddCondition = () => {
    const newCondition: Condition = {
      field: "",
      op: {
        type: "EqString",
        value: "",
      },
    };
    addCondition("and", newCondition);
  };

  const handleSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);

    try {
      const results = await searchDocuments(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const hasConditions =
    (query.and && query.and.length > 0) ||
    (query.or && query.or.length > 0) ||
    (query.not && query.not.length > 0);

  return (
    <div>
      <BoxRoot>
        <BoxHeader>
          <div className="flex items-center space-x-2">
            <IconFilter className="size-4 text-blue-600" />
            <h2 className="text-lg font-medium text-gray-900">Build a query</h2>
          </div>
        </BoxHeader>
        <BoxContent>
          <QueryBuilder />
        </BoxContent>
        <BoxFooter className="flex gap-4">
          <Button
            onClick={handleSearch}
            disabled={isSearching || !hasConditions}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            <IconSearch className="h-4 w-4" />
            <span>{isSearching ? "Searching..." : "Execute Search"}</span>
          </Button>

          <Button
            onClick={() => handleAddCondition()}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Condition
          </Button>
        </BoxFooter>
      </BoxRoot>

      {/* Search Results Section */}
      {hasSearched && (
        <div className="mt-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Search Results
              {!isSearching && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({searchResults.length}{" "}
                  {searchResults.length === 1 ? "result" : "results"} found)
                </span>
              )}
            </h3>
          </div>

          {isSearching ? (
            <SearchSkeletonGrid count={4} />
          ) : verifications.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {verifications.map((verification, index) => (
                <SearchResultCard
                  key={index}
                  batchId={verification.id}
                  hashSigner={verification.hashSigner}
                  hashStorage={verification.hashStorage}
                  source={verification.source}
                  hashSignerLoading={verification.hashSignerLoading}
                  hashStorageLoading={verification.hashStorageLoading}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <IconSearch className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No results found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Try adjusting your search criteria or adding different
                conditions to find what you're looking for.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-8">
        <UsageGuide />
      </div>
    </div>
  );
}

export function Search() {
  return (
    <QueryProvider>
      <Main />
    </QueryProvider>
  );
}

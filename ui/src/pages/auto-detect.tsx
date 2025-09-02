
import { SearchForm } from "@/components/popes/search-form";
import { useAutoDetectSearch } from "@/hooks/auto-detect";
import { AutoDetectResults } from "@/components/auto-detect/auto-detect-results";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function AutoDetect() {

    const { autoDetect, data, isPending, isError, error } = useAutoDetectSearch();

    const handleSearch = (params: {
        dst_mapped_ip: string;
        dst_mapped_port: string;
        timestamp: string;
    }) => {
        autoDetect(params)
    }

    return (
        <div className="space-y-8">
            <SearchForm
                onSearch={handleSearch}
                searching={isPending}
            />

            {isError && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        An unexpected error occurred: {error?.message || 'Unknown error'}
                    </AlertDescription>
                </Alert>
            )}

            {/* Render results only when data is available */}
            {data && <AutoDetectResults
                data={data}
                isPending={isPending}
            />}
        </div>
    );
}


import { SearchForm } from "@/components/popes/search-form";
import { useAutoDetectSearch } from "@/hooks/auto-detect";

export function AutoDetect() {

    const { autoDetect, data, isPending,  } = useAutoDetectSearch();

    const handleSearch = (params: {
        dst_mapped_ip: string;
        dst_mapped_port: string;
        timestamp: string;
    }) => {
        autoDetect(params)
    }


    return (
        <div className="space-y-8">
            {/* Search Form */}
            <SearchForm
                onSearch={handleSearch}
                searching={false}
            />
            <div>
                {JSON.stringify(data, null, 2)}
            </div>
        </div>
    );
}

// import * as React from "react";
// import type { Document } from "@/types/entities";

export function Search() {
  // const [documents, setDocuments] = React.useState<Document[]>([]);
  return <div>Search</div>;
}

// import { QueryBuilder } from "./components/search/query-builder";
// import { SearchResult } from "./components/search/search-result";
// import type { ConditionHook } from "./hooks/condition";
// import { useSearch } from "./hooks/search";
// import { convertToConditions } from "./lib/condition";

// function App() {
//   const { search, isPending } = useSearch();

//   const handleSearch = (conditions_hook: ConditionHook[]) => {
//     const conditions = convertToConditions(conditions_hook);
//     search({ query: { and: conditions } });
//   };

//   return (
//     <div className="p-6 space-y-10">
//       <QueryBuilder searching={isPending} onSearch={handleSearch} />

//       <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
//         <SearchResult
//           id="890fecf8-49f8-4295-8f0f-efd2f355e268"
//           source={{
//             ok: true,
//             top: [12, 2, 3, 123],
//           }}
//         />
//         <SearchResult
//           id="890fecf8-49f8-4295-8f0f-efd2f355e268"
//           source={{
//             ok: true,
//             top: [12, 2, 3, 123],
//           }}
//         />
//         <SearchResult
//           id="890fecf8-49f8-4295-8f0f-efd2f355e268"
//           source={{
//             ok: true,
//             top: [12, 2, 3, 123],
//           }}
//         />
//         <SearchResult
//           id="890fecf8-49f8-4295-8f0f-efd2f355e268"
//           source={{
//             ok: true,
//             top: [12, 2, 3, 123],
//           }}
//         />
//         <SearchResult
//           id="890fecf8-49f8-4295-8f0f-efd2f355e268"
//           source={{
//             ok: true,
//             top: [12, 2, 3, 123],
//           }}
//         />
//       </div>
//     </div>
//   );
// }

// export default App;

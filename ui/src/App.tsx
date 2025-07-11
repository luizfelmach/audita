import { SearchResult } from "./components/search/search-result";

function App() {
  return (
    <div className="p-6">
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
        <SearchResult
          id="890fecf8-49f8-4295-8f0f-efd2f355e268"
          source={{
            ok: true,
            top: [12, 2, 3, 123],
          }}
        />
        <SearchResult
          id="890fecf8-49f8-4295-8f0f-efd2f355e268"
          source={{
            ok: true,
            top: [12, 2, 3, 123],
          }}
        />
        <SearchResult
          id="890fecf8-49f8-4295-8f0f-efd2f355e268"
          source={{
            ok: true,
            top: [12, 2, 3, 123],
          }}
        />
        <SearchResult
          id="890fecf8-49f8-4295-8f0f-efd2f355e268"
          source={{
            ok: true,
            top: [12, 2, 3, 123],
          }}
        />
        <SearchResult
          id="890fecf8-49f8-4295-8f0f-efd2f355e268"
          source={{
            ok: true,
            top: [12, 2, 3, 123],
          }}
        />
      </div>
    </div>
  );
}

export default App;

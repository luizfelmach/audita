import { SearchResult } from "./components/search/search-result";

function App() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <SearchResult
        id="meu_id3"
        source={{
          ok: true,
          top: [12, 2, 3, 123],
        }}
      />
    </div>
  );
}

export default App;

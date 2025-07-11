import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Dashboard } from "./layouts/dashboard";
import { Overview } from "./pages/overview";
import { Search } from "./pages/search";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />}>
          <Route index element={<Overview />} />
          <Route path="search" element={<Search />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

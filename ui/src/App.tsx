import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Dashboard } from "./layouts/dashboard";
import { Overview } from "./pages/overview";
import { Search } from "./pages/search";
import { Popes } from "./pages/popes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />}>
          <Route index element={<Overview />} />
          <Route path="/search" element={<Search />} />
          <Route path="/popes" element={<Popes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

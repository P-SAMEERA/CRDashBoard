import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/dashboard";
import SystemDetail from "./pages/sysDetail";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/system/:system" element={<SystemDetail />} />
    </Routes>
  );
}

export default App;

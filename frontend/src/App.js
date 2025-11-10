import "./App.css";
import Sidebar from "./components/sidebar";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import PatrimonyPage from "./pages/PatrimonyPage";
import ScenarioPage from "./pages/ScenarioPage";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Router>
      <div className="App">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div
          className={`main-content ${
            sidebarOpen ? "with-sidebar" : "full-width"
          }`}
        >
          <div className="routes">
            <Routes>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/patrimony" element={<PatrimonyPage />} />
              <Route path="/scenario" element={<ScenarioPage />} />
              <Route path="/" element={<PatrimonyPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;

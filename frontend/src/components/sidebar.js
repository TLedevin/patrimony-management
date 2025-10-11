import "./sidebar.css";
import { Link, useLocation } from "react-router-dom";

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();

  return (
    <div className="full-sidebar">
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>
      <div className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="menu">
          <Link
            to="/patrimony"
            className={location.pathname === "/patrimony" ? "active" : ""}
          >
            Patrimony
          </Link>
          <Link
            to="/scenario"
            className={location.pathname === "/scenario" ? "active" : ""}
          >
            Scenario
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;

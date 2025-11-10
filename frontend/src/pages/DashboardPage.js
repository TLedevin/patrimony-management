import Header from "./../components/header.js";
import "./DashboardPage.css";

function DashboardPage() {
  return (
    <div className="dashboard-page">
      <Header HeaderTitle="Dashboard" />
      <div className="dashboard-main-content"></div>
    </div>
  );
}

export default DashboardPage;

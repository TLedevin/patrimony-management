import { useState, useEffect } from "react";
import Header from "./../components/header.js";
import ScenarioHeader from "../components/scenario_page/ScenarioHeader.js";
import ScenarioGraph from "../components/scenario_page/ScenarioGraph.js";
import InvestmentList from "../components/scenario_page/InvestmentList.js";
import AddScenarioModal from "../components/scenario_page/AddScenarioModal.js";
import AddInvestmentModal from "../components/scenario_page/AddInvestmentModal.js";
import "./ScenarioPage.css";
import { investmentTypes } from "../config/investmentTypes.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function ScenarioPage() {
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState("");
  const [scenarioData, setScenarioData] = useState(null);
  const [showAddScenarioModal, setShowAddScenarioModal] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState("");

  const [investments, setInvestments] = useState([]);
  const [selectedInvestment, setSelectedInvestment] = useState("");
  const [showAddInvestmentModal, setShowAddInvestmentModal] = useState(false);
  const [newInvestmentName, setNewInvestmentName] = useState("");
  const [investmentType, setInvestmentType] = useState("");
  const [investmentParams, setInvestmentParams] = useState({});
  const [selectedInvestmentsForGraph, setSelectedInvestmentsForGraph] =
    useState({});

  // Fetch scenarios on component mount
  useEffect(() => {
    const fetchScenarios = async () => {
      const response = await fetch("http://localhost:5000/api/load_scenarios/");
      const data = await response.json();
      setScenarios(Object.values(data));
    };
    fetchScenarios();
    const fetchScenarioData = async () => {
      if (selectedScenario) {
        try {
          const response = await fetch(
            `http://localhost:5000/api/get_scenario_data/?scenario_id=${selectedScenario}`
          );
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log("Fetched scenario data:", data);
          setScenarioData(data);
        } catch (error) {
          console.error("Error fetching scenario data:", error);
          setScenarioData(null);
        }
      } else {
        setScenarioData(null);
      }
    };

    fetchScenarioData();
  }, [selectedScenario]); // Added dependency array to prevent infinite re-renders

  return (
    <div className="scenario-page">
      <Header HeaderTitle="Scenario" />
      <div className="scenario-main-content">
        <ScenarioHeader
          selectedScenario={selectedScenario}
          scenarios={scenarios}
          setShowAddScenarioModal={setShowAddScenarioModal}
          setSelectedScenario={setSelectedScenario}
          setScenarios={setScenarios}
          setInvestments={setInvestments}
        />
        <div className="investments-main-content">
          <ScenarioGraph scenarioData={scenarioData} />
          <InvestmentList
            selectedScenario={selectedScenario}
            investments={investments}
            setShowAddInvestmentModal={setShowAddInvestmentModal}
            setScenarios={setScenarios}
            setInvestments={setInvestments}
            setScenarioData={setScenarioData}
          />
        </div>
        {/* Modal for adding new scenario */}
        {showAddScenarioModal && (
          <AddScenarioModal
            newScenarioName={newScenarioName}
            setNewScenarioName={setNewScenarioName}
            setShowAddScenarioModal={setShowAddScenarioModal}
            setScenarios={setScenarios}
            setInvestments={setInvestments}
            setSelectedScenario={setSelectedScenario}
          />
        )}
        {showAddInvestmentModal && (
          <AddInvestmentModal
            setInvestmentType={setInvestmentType}
            newInvestmentName={newInvestmentName}
            setNewInvestmentName={setNewInvestmentName}
            investmentParams={investmentParams}
            investmentType={investmentType}
            investmentTypes={investmentTypes}
            setInvestmentParams={setInvestmentParams}
            setShowAddInvestmentModal={setShowAddInvestmentModal}
            selectedScenario={selectedScenario}
            setScenarios={setScenarios}
            setInvestments={setInvestments}
            setSelectedInvestment={setSelectedInvestment}
            setScenarioData={setScenarioData}
          />
        )}
      </div>
    </div>
  );
}

export default ScenarioPage;

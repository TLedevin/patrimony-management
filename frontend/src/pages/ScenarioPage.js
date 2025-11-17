import { useState, useEffect } from "react";
import Header from "./../components/header.js";
import ScenarioHeader from "../components/scenario_page/ScenarioHeader.js";
import ScenarioGraph from "../components/scenario_page/ScenarioGraph.js";
import FinancialFlowList from "../components/scenario_page/FinancialFlowList.js";
import AddScenarioModal from "../components/scenario_page/AddScenarioModal.js";
import ModifyScenarioModal from "../components/scenario_page/ModifyScenarioModal.js";
import AddFinancialFlowModal from "../components/scenario_page/AddFinancialFlowModal.js";
import "./ScenarioPage.css";
import { financialFlowTypes } from "../config/financialFlowTypes.js";
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
  const [scenarioParams, setScenarioParams] = useState({});

  const [financialFlows, setFinancialFlows] = useState([]);
  const [showAddFinancialFlowModal, setShowAddFinancialFlowModal] =
    useState(false);
  const [showModifyScenarioModal, setShowModifyScenarioModal] = useState(false);
  const [newFinancialFlowName, setNewFinancialFlowName] = useState("");
  const [financialFlowType, setFinancialFlowType] = useState("");
  const [financialFlowSubType, setFinancialFlowSubType] = useState("");
  const [financialFlowParams, setFinancialFlowParams] = useState({});

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
        const response = await fetch(
          `http://localhost:5000/api/get_scenario_data/?scenario_id=${selectedScenario}`
        );
        const data = await response.json();
        console.log("Fetched scenario data:", data);
        setScenarioData(data);
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
          setFinancialFlows={setFinancialFlows}
          setShowModifyScenarioModal={setShowModifyScenarioModal}
          setScenarioParams={setScenarioParams}
        />
        <div className="financial-flows-main-content">
          <ScenarioGraph scenarioData={scenarioData} />
          <div className="lists-container">
            <FinancialFlowList
              selectedScenario={selectedScenario}
              financialFlows={financialFlows}
              setShowAddFinancialFlowModal={setShowAddFinancialFlowModal}
              setScenarios={setScenarios}
              setFinancialFlows={setFinancialFlows}
              setScenarioData={setScenarioData}
              financialFlowTypes={financialFlowTypes}
            />
          </div>
        </div>
        {/* Modal for adding new scenario */}
        {showAddScenarioModal && (
          <AddScenarioModal
            scenarioParams={scenarioParams}
            setScenarioParams={setScenarioParams}
            setShowAddScenarioModal={setShowAddScenarioModal}
            setScenarios={setScenarios}
            setFinancialFlows={setFinancialFlows}
            setSelectedScenario={setSelectedScenario}
          />
        )}
        {showModifyScenarioModal && (
          <ModifyScenarioModal
            scenarios={scenarios}
            scenarioParams={scenarioParams}
            setScenarioParams={setScenarioParams}
            setShowModifyScenarioModal={setShowModifyScenarioModal}
            selectedScenario={selectedScenario}
            setScenarios={setScenarios}
            setScenarioData={setScenarioData}
          />
        )}
        {showAddFinancialFlowModal && (
          <AddFinancialFlowModal
            setFinancialFlowType={setFinancialFlowType}
            newFinancialFlowName={newFinancialFlowName}
            setNewFinancialFlowName={setNewFinancialFlowName}
            financialFlowParams={financialFlowParams}
            financialFlowType={financialFlowType}
            financialFlowTypes={financialFlowTypes}
            setFinancialFlowParams={setFinancialFlowParams}
            setFinancialFlowSubType={setFinancialFlowSubType}
            financialFlowSubType={financialFlowSubType}
            setShowAddFinancialFlowModal={setShowAddFinancialFlowModal}
            selectedScenario={selectedScenario}
            setScenarios={setScenarios}
            setFinancialFlows={setFinancialFlows}
            setScenarioData={setScenarioData}
          />
        )}
      </div>
    </div>
  );
}

export default ScenarioPage;

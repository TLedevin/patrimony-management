import { useState, useEffect } from "react";
import Header from "./../components/header.js";
import ScenarioHeader from "../components/scenario_page/ScenarioHeader.js";
import ScenarioGraph from "../components/scenario_page/ScenarioGraph.js";
import PlacementList from "../components/scenario_page/PlacementList.js";
import AddScenarioModal from "../components/scenario_page/AddScenarioModal.js";
import ModifyScenarioModal from "../components/scenario_page/ModifyScenarioModal.js";
import AddPlacementModal from "../components/scenario_page/AddPlacementModal.js";
import "./ScenarioPage.css";
import { placementTypes } from "../config/placementTypes.js";
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

  const [placements, setPlacements] = useState([]);
  const [selectedPlacement, setSelectedPlacement] = useState("");
  const [showAddPlacementModal, setShowAddPlacementModal] = useState(false);
  const [showModifyScenarioModal, setShowModifyScenarioModal] = useState(false);
  const [newPlacementName, setNewPlacementName] = useState("");
  const [placementType, setPlacementType] = useState("");
  const [placementSubType, setPlacementSubType] = useState("");
  const [placementParams, setPlacementParams] = useState({});

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
          setPlacements={setPlacements}
          setShowModifyScenarioModal={setShowModifyScenarioModal}
          setScenarioParams={setScenarioParams}
        />
        <div className="placements-main-content">
          <ScenarioGraph scenarioData={scenarioData} />
          <div className="lists-container">
            <PlacementList
              selectedScenario={selectedScenario}
              placements={placements}
              setShowAddPlacementModal={setShowAddPlacementModal}
              setScenarios={setScenarios}
              setPlacements={setPlacements}
              setScenarioData={setScenarioData}
              placementTypes={placementTypes}
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
            setPlacements={setPlacements}
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
        {showAddPlacementModal && (
          <AddPlacementModal
            setPlacementType={setPlacementType}
            newPlacementName={newPlacementName}
            setNewPlacementName={setNewPlacementName}
            placementParams={placementParams}
            placementType={placementType}
            placementTypes={placementTypes}
            setPlacementParams={setPlacementParams}
            setPlacementSubType={setPlacementSubType}
            placementSubType={placementSubType}
            setShowAddPlacementModal={setShowAddPlacementModal}
            selectedScenario={selectedScenario}
            setScenarios={setScenarios}
            setPlacements={setPlacements}
            setSelectedPlacement={setSelectedPlacement}
            setScenarioData={setScenarioData}
          />
        )}
      </div>
    </div>
  );
}

export default ScenarioPage;

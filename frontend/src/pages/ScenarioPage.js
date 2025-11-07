import { useState, useEffect } from "react";
import Header from "./../components/header.js";
import ScenarioHeader from "../components/scenario_page/ScenarioHeader.js";
import ScenarioGraph from "../components/scenario_page/ScenarioGraph.js";
import InvestmentList from "../components/scenario_page/InvestmentList.js";
import ChargeList from "../components/scenario_page/ChargeList.js";
import AddScenarioModal from "../components/scenario_page/AddScenarioModal.js";
import ModifyScenarioModal from "../components/scenario_page/ModifyScenarioModal.js";
import AddInvestmentModal from "../components/scenario_page/AddInvestmentModal.js";
import AddChargeModal from "../components/scenario_page/AddChargeModal.js";
import "./ScenarioPage.css";
import { investmentTypes } from "../config/investmentTypes.js";
import { chargeTypes } from "../config/chargeTypes.js";
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
  const [scenarioDataEnriched, setScenarioDataEnriched] = useState(null);
  const [showAddScenarioModal, setShowAddScenarioModal] = useState(false);
  const [scenarioParams, setScenarioParams] = useState({});

  const [investments, setInvestments] = useState([]);
  const [selectedInvestment, setSelectedInvestment] = useState("");
  const [showAddInvestmentModal, setShowAddInvestmentModal] = useState(false);
  const [showModifyScenarioModal, setShowModifyScenarioModal] = useState(false);
  const [newInvestmentName, setNewInvestmentName] = useState("");
  const [investmentType, setInvestmentType] = useState("");
  const [investmentParams, setInvestmentParams] = useState({});

  const [charges, setCharges] = useState([]);
  const [selectedCharge, setSelectedCharge] = useState("");
  const [showAddChargeModal, setShowAddChargeModal] = useState(false);
  const [newChargeName, setNewChargeName] = useState("");
  const [chargeType, setChargeType] = useState("");
  const [chargeParams, setChargeParams] = useState({});

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

    const fetchScenarioDataEnriched = async () => {
      if (selectedScenario) {
        const response = await fetch(
          `http://localhost:5000/api/get_scenario_data_enriched/?scenario_id=${selectedScenario}`
        );
        const data = await response.json();
        console.log("Fetched scenario data enriched:", data);
        setScenarioDataEnriched(data);
      } else {
        setScenarioDataEnriched(null);
      }
    };

    fetchScenarioDataEnriched();
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
          setCharges={setCharges}
          setShowModifyScenarioModal={setShowModifyScenarioModal}
          setScenarioParams={setScenarioParams}
        />
        <div className="investments-main-content">
          <ScenarioGraph
            scenarioData={scenarioData}
            scenarioDataEnriched={scenarioDataEnriched}
          />
          <div className="lists-container">
            <InvestmentList
              selectedScenario={selectedScenario}
              investments={investments}
              setShowAddInvestmentModal={setShowAddInvestmentModal}
              setScenarios={setScenarios}
              setInvestments={setInvestments}
              setScenarioData={setScenarioData}
              investmentTypes={investmentTypes}
            />
            <ChargeList
              selectedScenario={selectedScenario}
              charges={charges}
              setShowAddChargeModal={setShowAddChargeModal}
              setScenarios={setScenarios}
              setCharges={setCharges}
              setScenarioData={setScenarioData}
              chargeTypes={chargeTypes}
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
            setInvestments={setInvestments}
            setCharges={setCharges}
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
            setScenarioDataEnriched={setScenarioDataEnriched}
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
            setScenarioDataEnriched={setScenarioDataEnriched}
          />
        )}
        {showAddChargeModal && (
          <AddChargeModal
            setChargeType={setChargeType}
            newChargeName={newChargeName}
            setNewChargeName={setNewChargeName}
            chargeParams={chargeParams}
            chargeType={chargeType}
            chargeTypes={chargeTypes}
            setChargeParams={setChargeParams}
            setShowAddChargeModal={setShowAddChargeModal}
            selectedScenario={selectedScenario}
            setScenarios={setScenarios}
            setCharges={setCharges}
            setSelectedCharge={setSelectedCharge}
            setScenarioData={setScenarioData}
            setScenarioDataEnriched={setScenarioDataEnriched}
          />
        )}
      </div>
    </div>
  );
}

export default ScenarioPage;

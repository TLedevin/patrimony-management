import { useState } from "react";
import ModifyFinancialFlowModal from "./ModifyFinancialFlowModal";
import "./FinancialFlowList.css";

function FinancialFlowList({
  selectedScenario,
  financialFlows,
  setShowAddFinancialFlowModal,
  setScenarios,
  setFinancialFlows,
  setScenarioData,
  financialFlowTypes,
}) {
  const [showModifyFinancialFlowModal, setShowModifyFinancialFlowModal] =
    useState(false);
  const [selectedFinancialFlow, setSelectedFinancialFlow] = useState(null);
  const [financialFlowName, setFinancialFlowName] = useState("");
  const [financialFlowType, setFinancialFlowType] = useState("");
  const [financialFlowSubType, setFinancialFlowSubType] = useState("");
  const [financialFlowParams, setFinancialFlowParams] = useState({});
  const handleDeleteFinancialFlow = async (financialFlowId) => {
    if (!selectedScenario) {
      alert("Please select a scenario first");
      return;
    }

    if (
      window.confirm("Are you sure you want to delete this financial flow?")
    ) {
      const response = await fetch(
        `http://localhost:5000/api/delete_financial_flow/${selectedScenario}/${financialFlowId}`,
        { method: "GET" }
      );

      if (response.ok) {
        // Refresh financial flows list
        const scenariosResponse = await fetch(
          "http://localhost:5000/api/load_scenarios/"
        );
        const scenariosData = await scenariosResponse.json();
        const newScenarios = Object.values(scenariosData);
        setScenarios(newScenarios);
        const scenario = newScenarios.find((s) => s.id === selectedScenario);
        setFinancialFlows(Object.values(scenario.financial_flows));
      } else {
        alert("Failed to delete financial flow");
      }
      const scenarioData = await fetch(
        `http://localhost:5000/api/get_scenario_data/?scenario_id=${selectedScenario}`
      );
      if (!scenarioData.ok) {
        throw new Error(`HTTP error! status: ${scenarioData.status}`);
      }
      const data = await scenarioData.json();
      console.log("Fetched scenario data:", data);
      setScenarioData(data);
    }
  };

  return (
    <div className="financial-flows-list">
      <div className="financial-flows-header">
        <button
          className="add-financial-flow-btn"
          onClick={() => {
            if (!selectedScenario) {
              alert("Please select a scenario before adding a financial flow");
              return;
            }
            setShowAddFinancialFlowModal(true);
          }}
        >
          <span>+</span> Add financial flow
        </button>
      </div>
      <div className="financial-flows-content">
        {selectedScenario ? (
          financialFlows.length > 0 ? (
            <div className="financial-flows-grid">
              {financialFlows.map((financialFlow) => (
                <div
                  key={financialFlow.id}
                  className={`financial-flow-card ${financialFlow.type}`}
                  onClick={() => {
                    setSelectedFinancialFlow(financialFlow);
                    setFinancialFlowName(financialFlow.name);
                    setFinancialFlowType(financialFlow.type);
                    setFinancialFlowSubType(financialFlow.subtype);
                    setFinancialFlowParams(financialFlow.parameters);
                    setShowModifyFinancialFlowModal(true);
                  }}
                >
                  <div className="financial-flow-icon">
                    {financialFlowTypes[financialFlow.type]?.[
                      financialFlow.subtype
                    ]?.icon || "💰"}
                  </div>
                  <div className="financial-flow-info">
                    <h3 className="financial-flow-type">
                      {
                        financialFlowTypes[financialFlow.type]?.[
                          financialFlow.subtype
                        ]?.label
                      }
                    </h3>
                    <span className="financial-flow-name">
                      {financialFlow.name}
                    </span>
                  </div>
                  <button
                    className="delete-financial-flow-btn"
                    title="Delete financial flow"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click when clicking delete
                      handleDeleteFinancialFlow(financialFlow.id);
                    }}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-financial-flows-message">
              No financial flows found for this scenario.
            </p>
          )
        ) : (
          <p className="no-financial-flows-message">
            Please select a scenario to view financial flows.
          </p>
        )}
      </div>
      {showModifyFinancialFlowModal && selectedFinancialFlow && (
        <ModifyFinancialFlowModal
          financialFlow={selectedFinancialFlow}
          setFinancialFlowType={setFinancialFlowType}
          financialFlowName={financialFlowName}
          setFinancialFlowName={setFinancialFlowName}
          financialFlowParams={financialFlowParams}
          financialFlowType={financialFlowType}
          financialFlowTypes={financialFlowTypes}
          setFinancialFlowParams={setFinancialFlowParams}
          financialFlowSubType={financialFlowSubType}
          setFinancialFlowSubType={setFinancialFlowSubType}
          setShowModifyFinancialFlowModal={setShowModifyFinancialFlowModal}
          selectedScenario={selectedScenario}
          setScenarios={setScenarios}
          setFinancialFlows={setFinancialFlows}
          setScenarioData={setScenarioData}
        />
      )}
    </div>
  );
}

export default FinancialFlowList;

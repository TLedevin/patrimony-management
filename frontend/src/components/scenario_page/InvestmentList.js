import { useState } from "react";
import ModifyInvestmentModal from "./ModifyInvestmentModal";
import "./InvestmentList.css";

function InvestmentList({
  selectedScenario,
  investments,
  setShowAddInvestmentModal,
  setScenarios,
  setInvestments,
  setScenarioData,
  investmentTypes,
}) {
  const [showModifyInvestmentModal, setShowModifyInvestmentModal] =
    useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [investmentName, setInvestmentName] = useState("");
  const [investmentType, setInvestmentType] = useState("");
  const [investmentParams, setInvestmentParams] = useState({});
  const handleDeleteInvestment = async (investmentId) => {
    if (!selectedScenario) {
      alert("Please select a scenario first");
      return;
    }

    if (window.confirm("Are you sure you want to delete this investment?")) {
      const response = await fetch(
        `http://localhost:5000/api/delete_investment/${selectedScenario}/${investmentId}`,
        { method: "GET" }
      );

      if (response.ok) {
        // Refresh investments list
        const scenariosResponse = await fetch(
          "http://localhost:5000/api/load_scenarios/"
        );
        const scenariosData = await scenariosResponse.json();
        const newScenarios = Object.values(scenariosData);
        setScenarios(newScenarios);
        const scenario = newScenarios.find((s) => s.id === selectedScenario);
        setInvestments(Object.values(scenario.investments));
      } else {
        alert("Failed to delete investment");
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
    <div className="investments-list">
      <div className="investments-header">
        <button
          className="add-investment-btn"
          onClick={() => {
            if (!selectedScenario) {
              alert("Please select a scenario before adding an investment");
              return;
            }
            setShowAddInvestmentModal(true);
          }}
        >
          <span>+</span> Add Investment
        </button>
      </div>
      <div className="investments-content">
        {selectedScenario ? (
          investments.length > 0 ? (
            <div className="investments-grid">
              {investments.map((investment) => (
                <div
                  key={investment.id}
                  className="investment-card"
                  onClick={() => {
                    setSelectedInvestment(investment);
                    setInvestmentName(investment.name);
                    setInvestmentType(investment.type);
                    setInvestmentParams(investment.parameters);
                    setShowModifyInvestmentModal(true);
                  }}
                >
                  <div className="investment-icon">💰</div>
                  <div className="investment-info">
                    <h3 className="investment-type">
                      {investmentTypes[investment.type]?.label}
                    </h3>
                    <span className="investment-name">{investment.name}</span>
                  </div>
                  <button
                    className="delete-investment-btn"
                    title="Delete investment"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click when clicking delete
                      handleDeleteInvestment(investment.id);
                    }}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-investments-message">
              No investments found for this scenario.
            </p>
          )
        ) : (
          <p className="no-investments-message">
            Please select a scenario to view investments.
          </p>
        )}
      </div>
      {showModifyInvestmentModal && selectedInvestment && (
        <ModifyInvestmentModal
          investment={selectedInvestment}
          setInvestmentType={setInvestmentType}
          investmentName={investmentName}
          setInvestmentName={setInvestmentName}
          investmentParams={investmentParams}
          investmentType={investmentType}
          investmentTypes={investmentTypes}
          setInvestmentParams={setInvestmentParams}
          setShowModifyInvestmentModal={setShowModifyInvestmentModal}
          selectedScenario={selectedScenario}
          setScenarios={setScenarios}
          setInvestments={setInvestments}
          setScenarioData={setScenarioData}
        />
      )}
    </div>
  );
}

export default InvestmentList;

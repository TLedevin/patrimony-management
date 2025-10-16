import React, { useState, useEffect } from "react";
import Header from "./../components/header.js";
import "./ScenarioPage.css";

function ScenarioPage() {
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState("");
  const [showAddScenarioModal, setShowAddScenarioModal] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState("");

  const [investments, setInvestments] = useState([]);
  const [selectedInvestment, setSelectedInvestment] = useState("");
  const [showAddInvestmentModal, setShowAddInvestmentModal] = useState(false);
  const [newInvestmentName, setNewInvestmentName] = useState("");

  // Fetch scenarios on component mount
  useEffect(() => {
    const fetchScenarios = async () => {
      const response = await fetch("http://localhost:5000/api/load_scenarios/");
      const data = await response.json();
      setScenarios(Object.values(data));
    };
    fetchScenarios();
  }, []); // Added dependency array to prevent infinite re-renders

  const handleScenarioChange = async (event) => {
    const scenarioId = parseInt(event.target.value);
    setSelectedScenario(scenarioId);
    console.log("Selected scenario:", scenarioId);

    // Fetch investments for the selected scenario
    if (scenarioId) {
      const scenario = scenarios.find((s) => s.id === scenarioId);
      setInvestments(Object.values(scenario.investments));
    } else {
      setInvestments([]);
    }
  };

  const handleAddScenario = async () => {
    if (newScenarioName.trim() === "") {
      alert("Please enter a scenario name");
      return;
    }

    const response = await fetch(
      `http://localhost:5000/api/add_scenario/${encodeURIComponent(
        newScenarioName
      )}`,
      { method: "POST" }
    );

    const result = await response.json();
    console.log("Scenario added:", result);

    // Refresh scenarios list
    const scenariosResponse = await fetch(
      "http://localhost:5000/api/load_scenarios/"
    );
    const scenariosData = await scenariosResponse.json();
    setScenarios(Object.values(scenariosData));
    setInvestments([]);

    // Reset modal state
    setShowAddScenarioModal(false);
    setNewScenarioName("");
    setSelectedScenario(result);
  };

  const handleDeleteScenario = async () => {
    if (!selectedScenario) {
      alert("Please select a scenario to delete");
      return;
    } else {
      let response = null;
      if (window.confirm("Are you sure you want to delete this scenario?")) {
        response = await fetch(
          `http://localhost:5000/api/delete_scenario/${encodeURIComponent(
            selectedScenario
          )}`,
          { method: "GET" }
        );
        setSelectedScenario("");
      }

      const scenariosResponse = await fetch(
        "http://localhost:5000/api/load_scenarios/"
      );
      const scenariosData = await scenariosResponse.json();
      setScenarios(Object.values(scenariosData));

      if (response && response.ok) {
        const result = await response.json();
        console.log("Scenario deleted:", result);
      }
    }
  };

  const handleModalClose = () => {
    setShowAddScenarioModal(false);
    setNewScenarioName("");
  };

  const handleAddInvestment = async () => {
    if (!selectedScenario) {
      alert("Please select a scenario to add an investment");
      return;
    }
    if (newInvestmentName.trim() === "") {
      alert("Please enter an investment name");
      return;
    }

    const response = await fetch(
      `http://localhost:5000/api/add_investment/${selectedScenario}/${encodeURIComponent(
        newInvestmentName
      )}`,
      { method: "POST" }
    );

    const result = await response.json();
    console.log("Investment added:", result);

    // Refresh investments list
    const scenariosResponse = await fetch(
      "http://localhost:5000/api/load_scenarios/"
    );
    const scenariosData = await scenariosResponse.json();
    console.log("New scenarios:", scenariosData);
    const newScenarios = Object.values(scenariosData);
    setScenarios(newScenarios);
    const scenario = newScenarios.find((s) => s.id === selectedScenario);
    console.log("New scenario:", scenario);
    setInvestments(Object.values(scenario.investments));

    // Reset modal state
    setShowAddInvestmentModal(false);
    setNewInvestmentName("");
    setSelectedInvestment(result);
  };

  const handleInvestmentModalClose = () => {
    setShowAddInvestmentModal(false);
    setNewInvestmentName("");
  };

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
    }
  };

  return (
    <div className="scenario-page">
      <Header HeaderTitle="Scenario" />
      <div className="scenario-main-content">
        <div className="scenario-header">
          <div className="scenario-controls">
            <select
              id="scenario-select"
              value={selectedScenario}
              onChange={handleScenarioChange}
              className="scenario-dropdown"
            >
              <option value="">-- Select a scenario --</option>
              {scenarios.length > 0 ? (
                scenarios.map((scenario) => (
                  <option key={scenario.id} value={scenario.id}>
                    {`${scenario.name}`}
                  </option>
                ))
              ) : (
                <option disabled>No scenarios available</option>
              )}
            </select>
            <button
              className="add-scenario-btn"
              onClick={() => setShowAddScenarioModal(true)}
              title="Add new scenario"
            >
              +
            </button>
            <button
              className="delete-scenario-btn"
              onClick={handleDeleteScenario}
            >
              🗑️
            </button>
          </div>
        </div>
        <div className="investments-main-content">
          <div className="investments-graph"></div>
          <div className="investments-list">
            <div className="investments-header">
              <button
                className="add-investment-btn"
                onClick={() => setShowAddInvestmentModal(true)}
              >
                <span>+</span> Add Investment
              </button>
            </div>
            <div className="investments-content">
              {selectedScenario ? (
                investments.length > 0 ? (
                  <div className="investments-grid">
                    {investments.map((investment) => (
                      <div key={investment.id} className="investment-card">
                        <div className="investment-icon">💰</div>
                        <div className="investment-info">
                          <h3 className="investment-name">{investment.name}</h3>
                          <span className="investment-id">
                            #{investment.id}
                          </span>
                        </div>
                        <button
                          className="delete-investment-btn"
                          title="Delete investment"
                          onClick={() => handleDeleteInvestment(investment.id)}
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
          </div>
        </div>

        {/* Modal for adding new scenario */}
        {showAddScenarioModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Add New Scenario</h3>
              <input
                type="text"
                value={newScenarioName}
                onChange={(e) => setNewScenarioName(e.target.value)}
                placeholder="Enter scenario name"
                className="scenario-name-input"
                autoFocus
              />
              <div className="modal-buttons">
                <button onClick={handleAddScenario} className="btn-confirm">
                  Add
                </button>
                <button onClick={handleModalClose} className="btn-cancel">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {showAddInvestmentModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Add New Investment</h3>
              <input
                type="text"
                value={newInvestmentName}
                onChange={(e) => setNewInvestmentName(e.target.value)}
                placeholder="Enter investment name"
                className="investment-name-input"
                autoFocus
              />
              <div className="modal-buttons">
                <button onClick={handleAddInvestment} className="btn-confirm">
                  Add
                </button>
                <button
                  onClick={handleInvestmentModalClose}
                  className="btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScenarioPage;

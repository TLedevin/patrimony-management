import React, { useState, useEffect } from "react";
import Header from "./../components/header.js";
import "./ScenarioPage.css";

function ScenarioPage() {
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState("");

  // Fetch scenarios on component mount
  useEffect(() => {
    const fetchScenarios = async () => {
      const response = await fetch("http://localhost:5000/api/load_scenarios/");
      const data = await response.json();
      setScenarios(Object.values(data));
    };
    fetchScenarios();
  }, []); // Added dependency array to prevent infinite re-renders

  const handleScenarioChange = (event) => {
    setSelectedScenario(event.target.value);
    console.log("Selected scenario:", event.target.value);
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

    // Reset modal state
    setShowAddModal(false);
    setNewScenarioName("");
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setNewScenarioName("");
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
                    {`${scenario.id}: ${scenario.name}`}
                  </option>
                ))
              ) : (
                <option disabled>No scenarios available</option>
              )}
            </select>
            <button
              className="add-scenario-btn"
              onClick={() => setShowAddModal(true)}
              title="Add new scenario"
            >
              +
            </button>
          </div>
        </div>

        {/* Modal for adding new scenario */}
        {showAddModal && (
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
      </div>
    </div>
  );
}

export default ScenarioPage;

import "./AddScenarioModal.css";

function AddScenarioModal({
  scenarioParams,
  setScenarioParams,
  setShowAddScenarioModal,
  setScenarios,
  setInvestments,
  setSelectedScenario,
}) {
  const handleAddScenario = async () => {
    if (scenarioParams.name.trim() === "") {
      alert("Please enter a scenario name");
      return;
    }

    const queryParams = new URLSearchParams({
      ...scenarioParams,
    });

    const response = await fetch(
      `http://localhost:5000/api/add_scenario?${queryParams.toString()}`,
      { method: "GET" }
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
    setSelectedScenario(result);
  };

  const handleModalClose = () => {
    setShowAddScenarioModal(false);
  };

  const handleParamChange = (paramId, value) => {
    setScenarioParams((prev) => ({
      ...prev,
      [paramId]: value,
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Add New Scenario</h3>
        <input
          type="text"
          value={scenarioParams.name || ""}
          onChange={(e) => handleParamChange("name", e.target.value)}
          placeholder="Enter scenario name"
          className="name-input"
          autoFocus
        />
        <hr className="dropdown-separator" />
        <div className="scenario-parameter">
          <label htmlFor="initial_deposit">Initial Deposit (€)</label>
          <input
            id="initial_deposit"
            type="number"
            value={scenarioParams.initial_deposit || 0}
            onChange={(e) =>
              handleParamChange("initial_deposit", e.target.value)
            }
            min={0}
            step={1000}
            className="scenario-parameter-input"
          />
        </div>
        <div className="scenario-parameter">
          <label htmlFor="monthly_deposit">Monthly Deposit (€)</label>
          <input
            id="monthly_deposit"
            type="number"
            value={scenarioParams.monthly_deposit || 0}
            onChange={(e) =>
              handleParamChange("monthly_deposit", e.target.value)
            }
            min={0}
            step={100}
            className="scenario-parameter-input"
          />
        </div>
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
  );
}

export default AddScenarioModal;

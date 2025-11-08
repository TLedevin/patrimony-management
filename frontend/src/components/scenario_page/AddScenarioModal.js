import "./AddScenarioModal.css";
import scenarioParamsConfig from "../../config/scenarioParams";

function AddScenarioModal({
  scenarioParams,
  setScenarioParams,
  setShowAddScenarioModal,
  setScenarios,
  setPlacements,
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
    setPlacements([]);

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
        {scenarioParamsConfig.map((param) => (
          <div key={param.id} className="scenario-parameter">
            <label htmlFor={param.id}>{param.label}</label>
            <input
              id={param.id}
              type={param.type}
              value={scenarioParams[param.id] ?? param.default}
              onChange={(e) => handleParamChange(param.id, e.target.value)}
              min={param.min}
              max={param.max}
              step={param.step}
              className={param.className || "scenario-parameter-input"}
            />
          </div>
        ))}
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

import "./AddScenarioModal.css";
import scenarioParamsConfig from "../../config/scenarioParams";

function ModifyScenarioModal({
  selectedScenario,
  scenarioParams,
  setScenarioParams,
  setShowModifyScenarioModal,
  setScenarios,
  setScenarioData,
}) {
  const handleModifyScenario = async () => {
    if (scenarioParams.name.trim() === "") {
      alert("Please enter a scenario name");
      return;
    }

    const queryParams = new URLSearchParams({
      scenario_id: selectedScenario,
      ...scenarioParams,
    });

    const response = await fetch(
      `http://localhost:5000/api/modify_scenario?${queryParams.toString()}`,
      { method: "GET" }
    );

    const result = await response.json();
    console.log("Scenario modified:", result);

    // Refresh scenario data
    const new_scenario_data = await fetch(
      `http://localhost:5000/api/get_scenario_data/?scenario_id=${selectedScenario}`
    );
    const data = await new_scenario_data.json();
    console.log("Fetched scenario data:", data);
    setScenarioData(data);

    // Refresh scenarios list
    const scenariosResponse = await fetch(
      "http://localhost:5000/api/load_scenarios/"
    );
    const scenariosData = await scenariosResponse.json();
    setScenarios(Object.values(scenariosData));

    // Reset modal state
    setShowModifyScenarioModal(false);
  };

  const handleModalClose = () => {
    setShowModifyScenarioModal(false);
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
        <h3>Modify Scenario</h3>
        <input
          type="text"
          value={scenarioParams.name || ""}
          onChange={(e) => handleParamChange("name", e.target.value)}
          placeholder="Enter scenario name"
          className="name-input"
          autoFocus
        />
        <hr className="dropdown-separator" />
        {scenarioParamsConfig.map((param) =>
          param.id !== "start_year" && param.id !== "start_month" ? (
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
          ) : null
        )}
        <div className="modal-buttons">
          <button onClick={handleModifyScenario} className="btn-confirm">
            Modify
          </button>
          <button onClick={handleModalClose} className="btn-cancel">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModifyScenarioModal;

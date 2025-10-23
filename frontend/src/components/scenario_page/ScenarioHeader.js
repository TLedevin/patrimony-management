import "./ScenarioHeader.css";
import scenarioParams from "../../config/scenarioParams";

function ScenarioHeader({
  selectedScenario,
  scenarios,
  setShowAddScenarioModal,
  setSelectedScenario,
  setScenarios,
  setInvestments,
  setShowModifyScenarioModal,
}) {
  const currentScenario = scenarios.find((s) => s.id === selectedScenario);
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

  const handleDeleteScenario = async () => {
    if (!selectedScenario) {
      alert("Please select a scenario to delete");
      return;
    } else {
      let response = null;
      if (window.confirm("Are you sure you want to delete this scenario?")) {
        response = await fetch(
          `http://localhost:5000/api/delete_scenario?id=${selectedScenario}`,
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

  return (
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
        <button className="delete-scenario-btn" onClick={handleDeleteScenario}>
          🗑️
        </button>
      </div>
      {currentScenario && (
        <div className="scenario-parameters-display">
          {scenarioParams.map((param) => (
            <div key={param.id} className="parameter-group">
              <label>{param.label}:</label>
              <input
                type={param.type}
                value={currentScenario[param.id] || param.default}
                min={param.min}
                max={param.max}
                step={param.step}
                readOnly
                className={param.className}
              />
            </div>
          ))}
        </div>
      )}
      <button
        className="modify-scenario-btn"
        onClick={() => setShowModifyScenarioModal(true)}
        title="Modify scenario"
      ></button>
    </div>
  );
}

export default ScenarioHeader;

import { useEffect } from "react";
import "./AddInvestmentModal.css";

function ModifyInvestmentModal({
  investment,
  setInvestmentType,
  investmentName,
  setInvestmentName,
  investmentParams,
  investmentType,
  investmentTypes,
  setInvestmentParams,
  setShowModifyInvestmentModal,
  selectedScenario,
  setScenarios,
  setInvestments,
  setScenarioData,
}) {
  const handleModifyInvestment = async () => {
    if (investmentName.trim() === "") {
      alert("Please enter an investment name");
      return;
    }

    // Validate required parameters
    const currentType = investmentTypes[investmentType];
    const missingParams = currentType.parameters.filter((param) => {
      if (!param.required) return false;
      const effectiveValue =
        investmentParams[param.id] !== undefined
          ? investmentParams[param.id]
          : param.default;
      // Treat undefined or empty string as missing. 0 is valid.
      return effectiveValue === undefined || effectiveValue === "";
    });

    // Validate end_year > start_year when both values are present (consider defaults)
    const hasEndYear = currentType.parameters.some((p) => p.id === "end_year");
    if (hasEndYear) {
      const endYear =
        investmentParams.end_year !== undefined
          ? investmentParams.end_year
          : currentType.parameters.find((p) => p.id === "end_year")?.default;
      const startYear =
        investmentParams.start_year !== undefined
          ? investmentParams.start_year
          : currentType.parameters.find((p) => p.id === "start_year")?.default;
      if (
        endYear !== undefined &&
        startYear !== undefined &&
        endYear <= startYear
      ) {
        alert("End year must be greater than start year");
        return;
      }
    }

    if (missingParams.length > 0) {
      alert(
        `Please fill in the following required fields: ${missingParams
          .map((p) => p.label)
          .join(", ")}`
      );
      return;
    }

    const queryParams = new URLSearchParams({
      scenario_id: selectedScenario,
      investment_id: investment.id,
      name: investmentName,
      investment_type: investmentType,
      ...investmentParams,
    });

    const response = await fetch(
      `http://localhost:5000/api/modify_investment/?${queryParams.toString()}`,
      { method: "GET" }
    );

    if (!response.ok) {
      alert("Failed to modify investment");
      return;
    }

    // Refresh investments list
    const scenariosResponse = await fetch(
      "http://localhost:5000/api/load_scenarios/"
    );
    const scenariosData = await scenariosResponse.json();
    const newScenarios = Object.values(scenariosData);
    setScenarios(newScenarios);
    const scenario = newScenarios.find((s) => s.id === selectedScenario);
    setInvestments(Object.values(scenario.investments));

    // Update scenario data
    const scenarioData = await fetch(
      `http://localhost:5000/api/get_scenario_data/?scenario_id=${selectedScenario}`
    );
    if (!scenarioData.ok) {
      throw new Error(`HTTP error! status: ${scenarioData.status}`);
    }
    const data = await scenarioData.json();
    setScenarioData(data);

    // Reset modal state
    setShowModifyInvestmentModal(false);
  };

  const handleParamChange = (paramId, value) => {
    setInvestmentParams((prev) => ({
      ...prev,
      [paramId]: value,
    }));
  };

  const handleInvestmentModalClose = () => {
    setShowModifyInvestmentModal(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Modify Investment</h3>
        <input
          type="text"
          value={investmentName}
          onChange={(e) => setInvestmentName(e.target.value)}
          placeholder="Enter investment name"
          className="name-input"
          autoFocus
        />
        <select
          id="investment-type-select"
          value={investmentType}
          onChange={(e) => setInvestmentType(e.target.value)}
          className="investment-type-dropdown"
          disabled
        >
          <option value="">-- Select an investment type --</option>
          {Object.entries(investmentTypes).map(([value, type]) => (
            <option key={value} value={value}>
              {type.label}
            </option>
          ))}
        </select>
        <hr className="dropdown-separator" />
        {investmentType &&
          investmentTypes[investmentType]?.parameters.map((param) => (
            <div key={param.id} className="investment-parameter">
              <label htmlFor={param.id}>{param.label}</label>
              <input
                id={param.id}
                type={param.type}
                value={investmentParams[param.id] ?? param.default ?? ""}
                onChange={(e) => handleParamChange(param.id, e.target.value)}
                min={param.min}
                max={param.max}
                step={param.step}
                required={param.required}
                className="investment-parameter-input"
              />
            </div>
          ))}
        <div className="modal-buttons">
          <button onClick={handleModifyInvestment} className="btn-confirm">
            Modify
          </button>
          <button onClick={handleInvestmentModalClose} className="btn-cancel">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModifyInvestmentModal;

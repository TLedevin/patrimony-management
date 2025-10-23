import { useEffect } from "react";
import "./AddInvestmentModal.css";

function AddInvestmentModal({
  setInvestmentType,
  newInvestmentName,
  setNewInvestmentName,
  investmentParams,
  investmentType,
  investmentTypes,
  setInvestmentParams,
  setShowAddInvestmentModal,
  selectedScenario,
  setScenarios,
  setInvestments,
  setSelectedInvestment,
  setScenarioData,
}) {
  const handleAddInvestment = async () => {
    if (newInvestmentName.trim() === "") {
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
      name: newInvestmentName,
      investment_type: investmentType,
      ...investmentParams,
    });

    const response = await fetch(
      `http://localhost:5000/api/add_investment?${queryParams.toString()}`,
      { method: "GET" }
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

    const scenarioData = await fetch(
      `http://localhost:5000/api/get_scenario_data/?scenario_id=${selectedScenario}`
    );
    if (!scenarioData.ok) {
      throw new Error(`HTTP error! status: ${scenarioData.status}`);
    }
    const data = await scenarioData.json();
    console.log("Fetched scenario data:", data);
    setScenarioData(data);

    // Reset modal state
    setShowAddInvestmentModal(false);
    setNewInvestmentName("");
    setSelectedInvestment(result);
    setInvestmentType("");
  };

  const handleParamChange = (paramId, value) => {
    setInvestmentParams((prev) => ({
      ...prev,
      [paramId]: value,
    }));
  };

  // When investmentType changes, initialize investmentParams with defaults so the
  // UI shows defaults and validation treats them as present.
  useEffect(() => {
    if (investmentType) {
      const paramsInit = {};
      const paramsConfig = investmentTypes[investmentType]?.parameters || [];
      paramsConfig.forEach((p) => {
        // Use default if provided, otherwise empty string so inputs are controlled
        paramsInit[p.id] = p.default !== undefined ? p.default : "";
      });
      setInvestmentParams(paramsInit);
    } else {
      setInvestmentParams({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [investmentType]);

  const handleInvestmentModalClose = () => {
    setShowAddInvestmentModal(false);
    setNewInvestmentName("");
    setInvestmentParams({});
    setInvestmentType("");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Add New Investment</h3>
        <input
          type="text"
          value={newInvestmentName}
          onChange={(e) => setNewInvestmentName(e.target.value)}
          placeholder="Enter investment name"
          className="name-input"
          autoFocus
        />
        <select
          id="investment-type-select"
          onChange={(e) => setInvestmentType(e.target.value)}
          className="investment-type-dropdown"
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
                onChange={(e) =>
                  handleParamChange(
                    param.id,
                    param.type === "number"
                      ? e.target.value === ""
                        ? ""
                        : Number(e.target.value)
                      : e.target.value
                  )
                }
                min={param.min}
                max={param.max}
                step={param.step}
                required={param.required}
                className="investment-parameter-input"
              />
            </div>
          ))}
        <div className="modal-buttons">
          <button onClick={handleAddInvestment} className="btn-confirm">
            Add
          </button>
          <button onClick={handleInvestmentModalClose} className="btn-cancel">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddInvestmentModal;

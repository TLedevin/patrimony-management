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
    const missingParams = currentType.parameters.filter(
      (param) => param.required && !investmentParams[param.id]
    );

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
        <input
          type="text"
          value={newInvestmentName}
          onChange={(e) => setNewInvestmentName(e.target.value)}
          placeholder="Enter investment name"
          className="investment-name-input"
          autoFocus
        />
        {investmentType &&
          investmentTypes[investmentType]?.parameters.map((param) => (
            <div key={param.id} className="investment-parameter">
              <label htmlFor={param.id}>{param.label}</label>
              <input
                id={param.id}
                type={param.type}
                value={investmentParams[param.id] || param.default || ""}
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

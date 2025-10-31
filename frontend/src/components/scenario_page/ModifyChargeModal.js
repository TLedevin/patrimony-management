import "./AddChargeModal.css";

function ModifyChargeModal({
  charge,
  setChargeType,
  chargeName,
  setChargeName,
  chargeParams,
  chargeType,
  chargeTypes,
  setChargeParams,
  setShowModifyChargeModal,
  selectedScenario,
  setScenarios,
  setCharges,
  setScenarioData,
}) {
  const handleModifyCharge = async () => {
    if (chargeName.trim() === "") {
      alert("Please enter a charge name");
      return;
    }

    // Validate required parameters
    const currentType = chargeTypes[chargeType];
    const missingParams = currentType.parameters.filter((param) => {
      if (!param.required) return false;
      const effectiveValue =
        chargeParams[param.id] !== undefined
          ? chargeParams[param.id]
          : param.default;
      // Treat undefined or empty string as missing. 0 is valid.
      return effectiveValue === undefined || effectiveValue === "";
    });

    // Validate end_year > start_year when both values are present (consider defaults)
    const hasEndYear = currentType.parameters.some((p) => p.id === "end_year");
    if (hasEndYear) {
      const endYear =
        chargeParams.end_year !== undefined
          ? chargeParams.end_year
          : currentType.parameters.find((p) => p.id === "end_year")?.default;
      const startYear =
        chargeParams.start_year !== undefined
          ? chargeParams.start_year
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
      charge_id: charge.id,
      name: chargeName,
      charge_type: chargeType,
      ...chargeParams,
    });

    const response = await fetch(
      `http://localhost:5000/api/modify_charge/?${queryParams.toString()}`,
      { method: "GET" }
    );

    if (!response.ok) {
      alert("Failed to modify charge");
      return;
    }

    // Refresh charges list
    const scenariosResponse = await fetch(
      "http://localhost:5000/api/load_scenarios/"
    );
    const scenariosData = await scenariosResponse.json();
    const newScenarios = Object.values(scenariosData);
    setScenarios(newScenarios);
    const scenario = newScenarios.find((s) => s.id === selectedScenario);
    setCharges(Object.values(scenario.charges));

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
    setShowModifyChargeModal(false);
  };

  const handleParamChange = (paramId, value) => {
    setChargeParams((prev) => ({
      ...prev,
      [paramId]: value,
    }));
  };

  const handleChargeModalClose = () => {
    setShowModifyChargeModal(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Modify Charge</h3>
        <input
          type="text"
          value={chargeName}
          onChange={(e) => setChargeName(e.target.value)}
          placeholder="Enter charge name"
          className="name-input"
          autoFocus
        />
        <select
          id="charge-type-select"
          value={chargeType}
          onChange={(e) => setChargeType(e.target.value)}
          className="charge-type-dropdown"
          disabled
        >
          <option value="">-- Select a charge type --</option>
          {Object.entries(chargeTypes).map(([value, type]) => (
            <option key={value} value={value}>
              {type.label}
            </option>
          ))}
        </select>
        <hr className="dropdown-separator" />
        {chargeType &&
          chargeTypes[chargeType]?.parameters.map((param) => (
            <div key={param.id} className="charge-parameter">
              <label htmlFor={param.id}>{param.label}</label>
              <input
                id={param.id}
                type={param.type}
                value={chargeParams[param.id] ?? param.default ?? ""}
                onChange={(e) => handleParamChange(param.id, e.target.value)}
                min={param.min}
                max={param.max}
                step={param.step}
                required={param.required}
                className="charge-parameter-input"
              />
            </div>
          ))}
        <div className="modal-buttons">
          <button onClick={handleModifyCharge} className="btn-confirm">
            Modify
          </button>
          <button onClick={handleChargeModalClose} className="btn-cancel">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModifyChargeModal;

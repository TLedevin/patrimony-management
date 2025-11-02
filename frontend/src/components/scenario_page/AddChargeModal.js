import { useEffect } from "react";
import "./AddChargeModal.css";

function AddChargeModal({
  setChargeType,
  newChargeName,
  setNewChargeName,
  chargeParams,
  chargeType,
  chargeTypes,
  setChargeParams,
  setShowAddChargeModal,
  selectedScenario,
  setScenarios,
  setCharges,
  setSelectedCharge,
  setScenarioData,
}) {
  const handleAddCharge = async () => {
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
      name: newChargeName,
      charge_type: chargeType,
      ...chargeParams,
    });

    const response = await fetch(
      `http://localhost:5000/api/add_charge?${queryParams.toString()}`,
      { method: "GET" }
    );

    const result = await response.json();
    console.log("Charge added:", result);

    // Refresh charges list
    const scenariosResponse = await fetch(
      "http://localhost:5000/api/load_scenarios/"
    );
    const scenariosData = await scenariosResponse.json();
    console.log("New scenarios:", scenariosData);
    const newScenarios = Object.values(scenariosData);
    setScenarios(newScenarios);
    const scenario = newScenarios.find((s) => s.id === selectedScenario);
    console.log("New scenario:", scenario);
    setCharges(Object.values(scenario.charges));

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
    setShowAddChargeModal(false);
    setNewChargeName("");
    setSelectedCharge(result);
    setChargeType("");
  };

  const handleParamChange = (paramId, value) => {
    setChargeParams((prev) => ({
      ...prev,
      [paramId]: value,
    }));
  };

  // When chargeType changes, initialize chargeParams with defaults so the
  // UI shows defaults and validation treats them as present.
  useEffect(() => {
    if (chargeType) {
      const paramsInit = {};
      const paramsConfig = chargeTypes[chargeType]?.parameters || [];
      paramsConfig.forEach((p) => {
        // Use default if provided, otherwise empty string so inputs are controlled
        paramsInit[p.id] = p.default !== undefined ? p.default : "";
      });
      setChargeParams(paramsInit);
    } else {
      setChargeParams({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chargeType]);

  const handleChargeModalClose = () => {
    setShowAddChargeModal(false);
    setNewChargeName("");
    setChargeParams({});
    setChargeType("");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Add New Charge</h3>
        <div className="input-container">
          <select
            id="charge-type-select"
            onChange={(e) => setChargeType(e.target.value)}
            className="charge-type-dropdown"
            autoFocus
          >
            <option value="">-- Select a charge type --</option>
            {Object.entries(chargeTypes).map(([value, type]) => (
              <option key={value} value={value}>
                {type.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={newChargeName}
            onChange={(e) => setNewChargeName(e.target.value)}
            placeholder="Enter charge name"
            className="name-input"
          />
        </div>
        <hr className="dropdown-separator" />
        {chargeType &&
          chargeTypes[chargeType]?.parameters.map((param) => (
            <div key={param.id} className="charge-parameter">
              <label htmlFor={param.id}>{param.label}</label>
              <input
                id={param.id}
                type={param.type}
                value={chargeParams[param.id] ?? param.default ?? ""}
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
                className="charge-parameter-input"
              />
            </div>
          ))}
        <div className="modal-buttons">
          <button onClick={handleAddCharge} className="btn-confirm">
            Add
          </button>
          <button onClick={handleChargeModalClose} className="btn-cancel">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddChargeModal;

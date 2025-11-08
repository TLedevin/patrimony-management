import "./AddPlacementModal.css";

function ModifyplacementModal({
  placement,
  setplacementType,
  placementName,
  setplacementName,
  placementParams,
  placementType,
  placementTypes,
  setplacementParams,
  setShowModifyplacementModal,
  selectedScenario,
  setScenarios,
  setplacements,
  setScenarioData,
}) {
  const handleModifyplacement = async () => {
    // Validate required parameters
    const currentType = placementTypes[placementType];
    const missingParams = currentType.parameters.filter((param) => {
      if (!param.required) return false;
      const effectiveValue =
        placementParams[param.id] !== undefined
          ? placementParams[param.id]
          : param.default;
      // Treat undefined or empty string as missing. 0 is valid.
      return effectiveValue === undefined || effectiveValue === "";
    });

    // Validate end_year > start_year when both values are present (consider defaults)
    const hasEndYear = currentType.parameters.some((p) => p.id === "end_year");
    if (hasEndYear) {
      const endYear =
        placementParams.end_year !== undefined
          ? placementParams.end_year
          : currentType.parameters.find((p) => p.id === "end_year")?.default;
      const startYear =
        placementParams.start_year !== undefined
          ? placementParams.start_year
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
      placement_id: placement.id,
      name: placementName,
      placement_type: placementType,
      ...placementParams,
    });

    const response = await fetch(
      `http://localhost:5000/api/modify_placement/?${queryParams.toString()}`,
      { method: "GET" }
    );

    if (!response.ok) {
      alert("Failed to modify placement");
      return;
    }

    // Refresh placements list
    const scenariosResponse = await fetch(
      "http://localhost:5000/api/load_scenarios/"
    );
    const scenariosData = await scenariosResponse.json();
    const newScenarios = Object.values(scenariosData);
    setScenarios(newScenarios);
    const scenario = newScenarios.find((s) => s.id === selectedScenario);
    setplacements(Object.values(scenario.placements));

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
    setShowModifyplacementModal(false);
  };

  const handleParamChange = (paramId, value) => {
    setplacementParams((prev) => ({
      ...prev,
      [paramId]: value,
    }));
  };

  const handleplacementModalClose = () => {
    setShowModifyplacementModal(false);
  };

  // Grouping logic for all placement types (all must have group property)
  let groupedParams = {};
  let groupOrder = [];
  if (placementType && placementTypes[placementType]?.parameters) {
    const params = placementTypes[placementType].parameters;
    params.forEach((param) => {
      const group = param.group || "other";
      if (!groupedParams[group]) {
        groupedParams[group] = [];
        groupOrder.push(group);
      }
      groupedParams[group].push(param);
    });
  }

  return (
    <div className="modal-overlay-placement">
      <div className="modal-content-placement">
        <h3>Modify placement</h3>
        <div className="input-container-placement">
          <select
            id="placement-type-select"
            value={placementType}
            onChange={(e) => setplacementType(e.target.value)}
            className="placement-type-dropdown"
            disabled
          >
            <option value="">-- Select an placement type --</option>
            {Object.entries(placementTypes).map(([value, type]) => (
              <option key={value} value={value}>
                {type.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={placementName}
            onChange={(e) => setplacementName(e.target.value)}
            placeholder="Enter placement name"
            className="name-input-placement"
          />
        </div>
        <hr className="dropdown-separator-placement" />
        {placementType && (
          <div className="placement-parameters-columns">
            {groupOrder.map((group) => (
              <div key={group} className="placement-parameter-column">
                <h4 className="placement-parameter-group-title">
                  {group.charAt(0).toUpperCase() + group.slice(1)}
                </h4>
                {groupedParams[group].map((param) => (
                  <div key={param.id} className="placement-parameter">
                    <label htmlFor={param.id}>{param.label}</label>
                    <input
                      id={param.id}
                      type={param.type}
                      value={placementParams[param.id] ?? param.default ?? ""}
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
                      className="placement-parameter-input"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        <div className="modal-buttons">
          <button onClick={handleModifyplacement} className="btn-confirm">
            Modify
          </button>
          <button onClick={handleplacementModalClose} className="btn-cancel">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModifyplacementModal;

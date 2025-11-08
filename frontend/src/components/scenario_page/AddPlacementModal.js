import { useEffect } from "react";
import "./AddPlacementModal.css";

function AddPlacementModal({
  setPlacementType,
  newPlacementName,
  setNewPlacementName,
  placementParams,
  placementType,
  placementTypes,
  setPlacementParams,
  setPlacementSubType,
  placementSubType,
  setShowAddPlacementModal,
  selectedScenario,
  setScenarios,
  setPlacements,
  setSelectedPlacement,
  setScenarioData,
}) {
  const handleAddPlacement = async () => {
    // Validate type selection
    if (!placementType) {
      alert("Please select a placement type");
      return;
    }

    if (!placementSubType) {
      alert("Please select a placement subtype");
      return;
    }

    // Get the current subtype configuration
    const currentType = placementTypes[placementType][placementSubType];

    // Validate required parameters
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
      name: newPlacementName,
      placement_type: placementType,
      placement_subtype: placementSubType,
      ...placementParams,
    });

    const response = await fetch(
      `http://localhost:5000/api/add_placement?${queryParams.toString()}`,
      { method: "GET" }
    );

    const result = await response.json();
    console.log("placement added:", result);

    // Refresh placements list
    const scenariosResponse = await fetch(
      "http://localhost:5000/api/load_scenarios/"
    );
    const scenariosData = await scenariosResponse.json();
    console.log("New scenarios:", scenariosData);
    const newScenarios = Object.values(scenariosData);
    setScenarios(newScenarios);
    const scenario = newScenarios.find((s) => s.id === selectedScenario);
    console.log("New scenario:", scenario);
    setPlacements(Object.values(scenario.placements));

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
    setShowAddPlacementModal(false);
    setNewPlacementName("");
    setSelectedPlacement(result);
    setPlacementType("");
  };

  const handleParamChange = (paramId, value) => {
    setPlacementParams((prev) => ({
      ...prev,
      [paramId]: value,
    }));
  };

  // When placementType changes, initialize placementParams with defaults so the
  // UI shows defaults and validation treats them as present.
  useEffect(() => {
    if (placementType && placementSubType) {
      const paramsInit = {};
      const paramsConfig =
        placementTypes[placementType][placementSubType]?.parameters || [];
      paramsConfig.forEach((p) => {
        // Use default if provided, otherwise empty string so inputs are controlled
        paramsInit[p.id] = p.default !== undefined ? p.default : "";
      });
      setPlacementParams(paramsInit);
    } else {
      setPlacementParams({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placementType, placementSubType]);

  const handleplacementModalClose = () => {
    setShowAddPlacementModal(false);
    setNewPlacementName("");
    setPlacementParams({});
    setPlacementType("");
  };

  // Grouping logic for all placement types (all must have group property)
  let groupedParams = {};
  let groupOrder = [];
  if (
    placementType &&
    placementSubType &&
    placementTypes[placementType]?.[placementSubType]?.parameters
  ) {
    const params = placementTypes[placementType][placementSubType].parameters;
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
        <h3>Add New placement</h3>
        <div className="input-container-placement">
          <div className="placement-type-selectors">
            <select
              id="placement-type-select"
              onChange={(e) => {
                setPlacementType(e.target.value);
                setPlacementSubType(""); // Reset subtype when main type changes
                setPlacementParams({}); // Reset params when main type changes
              }}
              className="placement-type-dropdown"
              autoFocus
              value={placementType}
            >
              <option value="">-- Select a placement type --</option>
              <option value="investment">Investment</option>
              <option value="charges">Charges</option>
            </select>
            {placementType && (
              <select
                id="placement-subtype-select"
                onChange={(e) => setPlacementSubType(e.target.value)}
                className="placement-type-dropdown"
                value={placementSubType}
              >
                <option value="">-- Select a subtype --</option>
                {Object.entries(placementTypes[placementType] || {}).map(
                  ([value, type]) => (
                    <option key={value} value={value}>
                      {type.label}
                    </option>
                  )
                )}
              </select>
            )}
          </div>
          <input
            type="text"
            value={newPlacementName}
            onChange={(e) => setNewPlacementName(e.target.value)}
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
          <button onClick={handleAddPlacement} className="btn-confirm">
            Add
          </button>
          <button onClick={handleplacementModalClose} className="btn-cancel">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddPlacementModal;

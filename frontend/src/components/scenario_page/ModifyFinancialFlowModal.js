import "./AddFinancialFlowModal.css";

function ModifyFinancialFlowModal({
  financialFlow,
  setFinancialFlowType,
  financialFlowName,
  setFinancialFlowName,
  financialFlowParams,
  financialFlowType,
  financialFlowTypes,
  setFinancialFlowParams,
  financialFlowSubType,
  setFinancialFlowSubType,
  setShowModifyFinancialFlowModal,
  selectedScenario,
  setScenarios,
  setFinancialFlows,
  setScenarioData,
}) {
  const handleModifyFinancialFlow = async () => {
    // Validate required parameters
    const currentType =
      financialFlowTypes[financialFlowType][financialFlowSubType];
    const missingParams = currentType.parameters.filter((param) => {
      if (!param.required) return false;
      const effectiveValue =
        financialFlowParams[param.id] !== undefined
          ? financialFlowParams[param.id]
          : param.default;
      // Treat undefined or empty string as missing. 0 is valid.
      return effectiveValue === undefined || effectiveValue === "";
    });

    // Validate end_year > start_year when both values are present (consider defaults)
    const hasEndYear = currentType.parameters.some((p) => p.id === "end_year");
    if (hasEndYear) {
      const endYear =
        financialFlowParams.end_year !== undefined
          ? financialFlowParams.end_year
          : currentType.parameters.find((p) => p.id === "end_year")?.default;
      const startYear =
        financialFlowParams.start_year !== undefined
          ? financialFlowParams.start_year
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
      financialFlow_id: financialFlow.id,
      name: financialFlowName,
      financialFlow_type: financialFlowType,
      financialFlow_subtype: financialFlowSubType,
      ...financialFlowParams,
    });

    const response = await fetch(
      `http://localhost:5000/api/modify_financial_flow/?${queryParams.toString()}`,
      { method: "GET" }
    );

    if (!response.ok) {
      alert("Failed to modify financial flow");
      return;
    }

    // Refresh financial flows list
    const scenariosResponse = await fetch(
      "http://localhost:5000/api/load_scenarios/"
    );
    const scenariosData = await scenariosResponse.json();
    const newScenarios = Object.values(scenariosData);
    setScenarios(newScenarios);
    const scenario = newScenarios.find((s) => s.id === selectedScenario);
    setFinancialFlows(Object.values(scenario.financialFlows));

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
    setShowModifyFinancialFlowModal(false);
  };

  const handleParamChange = (paramId, value) => {
    setFinancialFlowParams((prev) => ({
      ...prev,
      [paramId]: value,
    }));
  };

  const handleFinancialFlowModalClose = () => {
    setShowModifyFinancialFlowModal(false);
  };

  // Grouping logic for all financial flow types (all must have group property)
  let groupedParams = {};
  let groupOrder = [];
  if (
    financialFlowType &&
    financialFlowSubType &&
    financialFlowTypes[financialFlowType]?.[financialFlowSubType]?.parameters
  ) {
    const params =
      financialFlowTypes[financialFlowType][financialFlowSubType].parameters;
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
    <div className="modal-overlay-financial-flow">
      <div className="modal-content-financial-flow">
        <h3>Modify financial flow</h3>
        <div className="input-container-financial-flow">
          <div className="financial-flow-type-selectors">
            <select
              id="financial-flow-type-select"
              value={financialFlowType}
              onChange={(e) => setFinancialFlowType(e.target.value)}
              className="financial-flow-type-dropdown"
              disabled
            >
              <option value="">-- Select a financial flow type --</option>
              <option value="investment">Investment</option>
              <option value="charges">Charges</option>
            </select>
            <select
              id="financial-flow-subtype-select"
              value={financialFlowSubType}
              onChange={(e) => setFinancialFlowSubType(e.target.value)}
              className="financial-flow-type-dropdown"
              disabled
            >
              <option value="">-- Select a subtype --</option>
              {financialFlowType &&
                Object.entries(financialFlowTypes[financialFlowType] || {}).map(
                  ([value, type]) => (
                    <option key={value} value={value}>
                      {type.label}
                    </option>
                  )
                )}
            </select>
          </div>
          <input
            type="text"
            value={financialFlowName}
            onChange={(e) => setFinancialFlowName(e.target.value)}
            placeholder="Enter financial flow name"
            className="name-input-financial-flow"
          />
        </div>
        <hr className="dropdown-separator-financial-flow" />
        {financialFlowType && (
          <div className="financial-flow-parameters-columns">
            {groupOrder.map((group) => (
              <div key={group} className="financial-flow-parameter-column">
                <h4 className="financial-flow-parameter-group-title">
                  {group.charAt(0).toUpperCase() + group.slice(1)}
                </h4>
                {groupedParams[group].map((param) => (
                  <div key={param.id} className="financial-flow-parameter">
                    <label htmlFor={param.id}>{param.label}</label>
                    <input
                      id={param.id}
                      type={param.type}
                      value={
                        financialFlowParams[param.id] ?? param.default ?? ""
                      }
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
                      className="financial-flow-parameter-input"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        <div className="modal-buttons">
          <button onClick={handleModifyFinancialFlow} className="btn-confirm">
            Modify
          </button>
          <button
            onClick={handleFinancialFlowModalClose}
            className="btn-cancel"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModifyFinancialFlowModal;

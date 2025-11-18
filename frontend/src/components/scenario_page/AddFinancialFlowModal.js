import { useEffect } from "react";
import "./AddFinancialFlowModal.css";

function AddFinancialFlowModal({
  setFinancialFlowType,
  newFinancialFlowName,
  setNewFinancialFlowName,
  financialFlowParams,
  financialFlowType,
  financialFlowTypes,
  setFinancialFlowParams,
  setFinancialFlowSubType,
  financialFlowSubType,
  setShowAddFinancialFlowModal,
  selectedScenario,
  setScenarios,
  setFinancialFlows,
  setScenarioData,
}) {
  const handleAddFinancialFlow = async () => {
    // Validate type selection
    if (!financialFlowType) {
      alert("Please select a financial flow type");
      return;
    }

    if (!financialFlowSubType) {
      alert("Please select a financial flow subtype");
      return;
    }

    // Get the current subtype configuration
    const currentType =
      financialFlowTypes[financialFlowType][financialFlowSubType];

    // Validate required parameters
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
      name: newFinancialFlowName,
      financial_flow_type: financialFlowType,
      financial_flow_subtype: financialFlowSubType,
      ...financialFlowParams,
    });

    const response = await fetch(
      `http://localhost:5000/api/add_financial_flow?${queryParams.toString()}`,
      { method: "GET" }
    );

    const result = await response.json();
    console.log("financial flow added:", result);

    // Refresh financial flows list
    const scenariosResponse = await fetch(
      "http://localhost:5000/api/load_scenarios/"
    );
    const scenariosData = await scenariosResponse.json();
    console.log("New scenarios:", scenariosData);
    const newScenarios = Object.values(scenariosData);
    setScenarios(newScenarios);
    const scenario = newScenarios.find((s) => s.id === selectedScenario);
    console.log("New scenario:", scenario);
    setFinancialFlows(Object.values(scenario.financial_flows));

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
    setShowAddFinancialFlowModal(false);
    setNewFinancialFlowName("");
    setFinancialFlowType("");
  };

  const handleParamChange = (paramId, value) => {
    setFinancialFlowParams((prev) => ({
      ...prev,
      [paramId]: value,
    }));
  };

  // When financialFlowType changes, initialize financialFlowParams with defaults so the
  // UI shows defaults and validation treats them as present.
  useEffect(() => {
    if (financialFlowType && financialFlowSubType) {
      const paramsInit = {};
      const paramsConfig =
        financialFlowTypes[financialFlowType][financialFlowSubType]
          ?.parameters || [];
      paramsConfig.forEach((p) => {
        // Use default if provided, otherwise empty string so inputs are controlled
        paramsInit[p.id] = p.default !== undefined ? p.default : "";
      });
      setFinancialFlowParams(paramsInit);
    } else {
      setFinancialFlowParams({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [financialFlowType, financialFlowSubType]);

  const handleFinancialFlowModalClose = () => {
    setShowAddFinancialFlowModal(false);
    setNewFinancialFlowName("");
    setFinancialFlowParams({});
    setFinancialFlowType("");
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
        <h3>Add New financial flow</h3>
        <div className="input-container-financial-flow">
          <div className="financial-flow-type-selectors">
            <select
              id="financial-flow-type-select"
              onChange={(e) => {
                setFinancialFlowType(e.target.value);
                setFinancialFlowSubType(""); // Reset subtype when main type changes
                setFinancialFlowParams({}); // Reset params when main type changes
              }}
              className="financial-flow-type-dropdown"
              autoFocus
              value={financialFlowType}
            >
              <option value="">-- Select a financial flow type --</option>
              <option value="cash_inflow">Income</option>
              <option value="investment">Investment</option>
              <option value="charges">Charges</option>
            </select>
            {financialFlowType && (
              <select
                id="financial-flow-subtype-select"
                onChange={(e) => setFinancialFlowSubType(e.target.value)}
                className="financial-flow-type-dropdown"
                value={financialFlowSubType}
              >
                <option value="">-- Select a subtype --</option>
                {Object.entries(
                  financialFlowTypes[financialFlowType] || {}
                ).map(([value, type]) => (
                  <option key={value} value={value}>
                    {type.label}
                  </option>
                ))}
              </select>
            )}
          </div>
          <input
            type="text"
            value={newFinancialFlowName}
            onChange={(e) => setNewFinancialFlowName(e.target.value)}
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
          <button onClick={handleAddFinancialFlow} className="btn-confirm">
            Add
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

export default AddFinancialFlowModal;

import React, { useState, useEffect } from "react";
import Header from "./../components/header.js";
import "./ScenarioPage.css";
import { investmentTypes } from "../config/investmentTypes.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function ScenarioPage() {
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState("");
  const [showAddScenarioModal, setShowAddScenarioModal] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState("");

  const [investments, setInvestments] = useState([]);
  const [selectedInvestment, setSelectedInvestment] = useState("");
  const [showAddInvestmentModal, setShowAddInvestmentModal] = useState(false);
  const [newInvestmentName, setNewInvestmentName] = useState("");
  const [investmentType, setInvestmentType] = useState("");
  const [investmentParams, setInvestmentParams] = useState({});
  const [selectedInvestmentsForGraph, setSelectedInvestmentsForGraph] =
    useState({});

  // Fetch scenarios on component mount
  useEffect(() => {
    const fetchScenarios = async () => {
      const response = await fetch("http://localhost:5000/api/load_scenarios/");
      const data = await response.json();
      setScenarios(Object.values(data));
    };
    fetchScenarios();
  }, []); // Added dependency array to prevent infinite re-renders

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

  const handleAddScenario = async () => {
    if (newScenarioName.trim() === "") {
      alert("Please enter a scenario name");
      return;
    }

    const response = await fetch(
      `http://localhost:5000/api/add_scenario?name=${newScenarioName}`,
      { method: "GET" }
    );

    const result = await response.json();
    console.log("Scenario added:", result);

    // Refresh scenarios list
    const scenariosResponse = await fetch(
      "http://localhost:5000/api/load_scenarios/"
    );
    const scenariosData = await scenariosResponse.json();
    setScenarios(Object.values(scenariosData));
    setInvestments([]);

    // Reset modal state
    setShowAddScenarioModal(false);
    setNewScenarioName("");
    setSelectedScenario(result);
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

  const handleModalClose = () => {
    setShowAddScenarioModal(false);
    setNewScenarioName("");
  };

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

    // Reset modal state
    setShowAddInvestmentModal(false);
    setNewInvestmentName("");
    setSelectedInvestment(result);
    setInvestmentType("");
  };

  const handleInvestmentModalClose = () => {
    setShowAddInvestmentModal(false);
    setNewInvestmentName("");
    setInvestmentParams({});
    setInvestmentType("");
  };

  const handleParamChange = (paramId, value) => {
    setInvestmentParams((prev) => ({
      ...prev,
      [paramId]: value,
    }));
  };

  const handleDeleteInvestment = async (investmentId) => {
    if (!selectedScenario) {
      alert("Please select a scenario first");
      return;
    }

    if (window.confirm("Are you sure you want to delete this investment?")) {
      const response = await fetch(
        `http://localhost:5000/api/delete_investment/${selectedScenario}/${investmentId}`,
        { method: "GET" }
      );

      if (response.ok) {
        // Refresh investments list
        const scenariosResponse = await fetch(
          "http://localhost:5000/api/load_scenarios/"
        );
        const scenariosData = await scenariosResponse.json();
        const newScenarios = Object.values(scenariosData);
        setScenarios(newScenarios);
        const scenario = newScenarios.find((s) => s.id === selectedScenario);
        setInvestments(Object.values(scenario.investments));
      } else {
        alert("Failed to delete investment");
      }
    }
  };

  return (
    <div className="scenario-page">
      <Header HeaderTitle="Scenario" />
      <div className="scenario-main-content">
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
            <button
              className="delete-scenario-btn"
              onClick={handleDeleteScenario}
            >
              🗑️
            </button>
          </div>
        </div>
        <div className="investments-main-content">
          <div className="investments-graph">
            {selectedScenario && investments.length > 0 && (
              <>
                <div className="graph-filters">
                  {investments.map((investment) => (
                    <label key={investment.id} className="graph-filter-item">
                      <input
                        type="checkbox"
                        checked={
                          selectedInvestmentsForGraph[investment.id] || false
                        }
                        onChange={(e) => {
                          setSelectedInvestmentsForGraph((prev) => ({
                            ...prev,
                            [investment.id]: e.target.checked,
                          }));
                        }}
                      />
                      {investment.name}
                    </label>
                  ))}
                </div>
                <div className="graph-container">
                  <Line
                    data={{
                      labels: investments[0]?.data?.dates || [],
                      datasets: [
                        {
                          label: "Savings",
                          data: investments[0]?.data?.dates.map((_, index) => {
                            return Object.entries(selectedInvestmentsForGraph)
                              .filter(([_, isSelected]) => isSelected)
                              .reduce((sum, [investmentId]) => {
                                const investment = investments.find(
                                  (inv) => inv.id.toString() === investmentId
                                );
                                return (
                                  sum +
                                  (investment?.data?.patrimony?.savings[
                                    index
                                  ] || 0)
                                );
                              }, 0);
                          }),
                          borderWidth: 2,
                          borderColor: "rgba(64, 164, 164, 1)",
                          backgroundColor: "rgba(64, 164, 164, 0.3)",
                          fill: "stack",
                          tension: 0,
                          order: 1,
                          pointRadius: 2,
                          pointHoverRadius: 6,
                        },
                        {
                          label: "Cash",
                          data: investments[0]?.data?.dates.map((_, index) => {
                            return Object.entries(selectedInvestmentsForGraph)
                              .filter(([_, isSelected]) => isSelected)
                              .reduce((sum, [investmentId]) => {
                                const investment = investments.find(
                                  (inv) => inv.id.toString() === investmentId
                                );
                                return (
                                  sum +
                                  (investment?.data?.patrimony?.cash[index] ||
                                    0)
                                );
                              }, 0);
                          }),
                          borderWidth: 2,
                          borderColor: "rgba(223, 81, 112, 1)",
                          backgroundColor: "rgba(223, 81, 112, 0.3)",
                          fill: "stack",
                          tension: 0,
                          order: 1,
                          pointRadius: 2,
                          pointHoverRadius: 6,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      interaction: {
                        mode: "index",
                        intersect: false,
                      },
                      plugins: {
                        filler: {
                          propagate: true,
                        },
                        title: {
                          display: true,
                          text: "Total Patrimony Evolution",
                        },
                        tooltip: {
                          mode: "index",
                          callbacks: {
                            label: function (context) {
                              return `${
                                context.dataset.label
                              }: ${context.parsed.y.toFixed(2)} €`;
                            },
                            footer: function (tooltipItems) {
                              const total = tooltipItems.reduce(
                                (sum, item) => sum + item.parsed.y,
                                0
                              );
                              return `Total: ${total.toFixed(2)} €`;
                            },
                          },
                        },
                        legend: {
                          position: "bottom",
                        },
                      },
                      scales: {
                        y: {
                          stacked: true,
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: "Amount (€)",
                          },
                          ticks: {
                            callback: function (value) {
                              return value.toFixed(2) + " €";
                            },
                          },
                        },
                        x: {
                          stacked: true,
                        },
                      },
                    }}
                  />
                </div>
              </>
            )}
          </div>
          <div className="investments-list">
            <div className="investments-header">
              <button
                className="add-investment-btn"
                onClick={() => {
                  if (!selectedScenario) {
                    alert(
                      "Please select a scenario before adding an investment"
                    );
                    return;
                  }
                  setShowAddInvestmentModal(true);
                }}
              >
                <span>+</span> Add Investment
              </button>
            </div>
            <div className="investments-content">
              {selectedScenario ? (
                investments.length > 0 ? (
                  <div className="investments-grid">
                    {investments.map((investment) => (
                      <div key={investment.id} className="investment-card">
                        <div className="investment-icon">💰</div>
                        <div className="investment-info">
                          <h3 className="investment-name">{investment.name}</h3>
                          <span className="investment-id">
                            #{investment.id}
                          </span>
                        </div>
                        <button
                          className="delete-investment-btn"
                          title="Delete investment"
                          onClick={() => handleDeleteInvestment(investment.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-investments-message">
                    No investments found for this scenario.
                  </p>
                )
              ) : (
                <p className="no-investments-message">
                  Please select a scenario to view investments.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modal for adding new scenario */}
        {showAddScenarioModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Add New Scenario</h3>
              <input
                type="text"
                value={newScenarioName}
                onChange={(e) => setNewScenarioName(e.target.value)}
                placeholder="Enter scenario name"
                className="scenario-name-input"
                autoFocus
              />
              <div className="modal-buttons">
                <button onClick={handleAddScenario} className="btn-confirm">
                  Add
                </button>
                <button onClick={handleModalClose} className="btn-cancel">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {showAddInvestmentModal && (
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
                      onChange={(e) =>
                        handleParamChange(param.id, e.target.value)
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
                <button
                  onClick={handleInvestmentModalClose}
                  className="btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScenarioPage;

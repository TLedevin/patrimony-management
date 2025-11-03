import React from "react";
import "./ScenarioDataModal.css";

function ScenarioDataModal({
  isOpen,
  onClose,
  scenarioData,
  selectedTypes,
  investmentStyles,
}) {
  if (
    !isOpen ||
    !scenarioData ||
    !scenarioData.dates ||
    !scenarioData.patrimony
  )
    return null;

  // Validate that all selected types have corresponding data
  const validTypes = selectedTypes.filter(
    (type) =>
      scenarioData.patrimony[type] &&
      Array.isArray(scenarioData.patrimony[type]) &&
      scenarioData.patrimony[type].length === scenarioData.dates.length
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Scenario Data</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  {validTypes.map((type) => (
                    <th key={type}>{investmentStyles[type]?.label || type}</th>
                  ))}
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {scenarioData.dates.map((date, index) => (
                  <tr key={date}>
                    <td>{date}</td>
                    {validTypes.map((type) => {
                      const value = scenarioData.patrimony[type][index];
                      return (
                        <td key={type}>
                          {(value || 0).toLocaleString("fr-FR", {
                            maximumFractionDigits: 0,
                          })}{" "}
                          €
                        </td>
                      );
                    })}
                    <td>
                      {validTypes
                        .reduce(
                          (sum, type) =>
                            sum + (scenarioData.patrimony[type][index] || 0),
                          0
                        )
                        .toLocaleString("fr-FR", {
                          maximumFractionDigits: 0,
                        })}{" "}
                      €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScenarioDataModal;

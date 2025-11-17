import React from "react";
import "./ScenarioDataModal.css";

function scenarioDataModal({ isOpen, onClose, scenarioData, selectedTypes }) {
  if (
    !isOpen ||
    !scenarioData ||
    !scenarioData.dates ||
    !scenarioData.patrimony
  )
    return null;

  // Collect all unique patrimony types across all placements
  const allPatrimonyTypes = new Set();
  Object.keys(scenarioData.patrimony.placements).forEach((placementId) => {
    Object.keys(scenarioData.patrimony.placements[placementId])
      .filter(
        (key) =>
          Array.isArray(scenarioData.patrimony.placements[placementId][key]) &&
          key !== "net_real_estate"
      )
      .forEach((type) => allPatrimonyTypes.add(type));
  });
  const patrimonyTypesArray = Array.from(allPatrimonyTypes);

  // Helper function to calculate total patrimony for a specific type at a given index
  const calculateTotalByType = (type, index) => {
    let total = 0;
    Object.keys(scenarioData.patrimony.placements).forEach((placementId) => {
      if (
        scenarioData.patrimony.placements[placementId][type] &&
        Array.isArray(scenarioData.patrimony.placements[placementId][type])
      ) {
        total +=
          scenarioData.patrimony.placements[placementId][type][index] || 0;
      }
    });
    return total;
  };

  // Helper function to calculate global total patrimony at a given index
  const calculateGlobalTotal = (index) => {
    let total = 0;

    // Add all patrimony from placements
    Object.keys(scenarioData.patrimony.placements).forEach((placementId) => {
      Object.keys(scenarioData.patrimony.placements[placementId])
        .filter(
          (key) =>
            Array.isArray(
              scenarioData.patrimony.placements[placementId][key]
            ) && key !== "net_real_estate"
        )
        .forEach((type) => {
          total +=
            scenarioData.patrimony.placements[placementId][type][index] || 0;
        });
    });

    // Add cash
    total += scenarioData.patrimony.cash[index] || 0;

    return total;
  };

  return (
    <div className="table-overlay">
      <div className="table-content">
        <div className="table-header">
          <h2>Scenario Data</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="table-body">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th rowSpan="2">Date</th>
                  <th rowSpan="2">Initial & Monthly Cash Deposit</th>
                  {Object.keys(scenarioData.patrimony.placements).map(
                    (placementId) => {
                      const patrimonyTypes = Object.keys(
                        scenarioData.patrimony.placements[placementId]
                      ).filter((key) =>
                        Array.isArray(
                          scenarioData.patrimony.placements[placementId][key]
                        )
                      );
                      return (
                        <th
                          key={placementId}
                          colSpan={patrimonyTypes.length + 1}
                        >
                          placement {placementId}
                        </th>
                      );
                    }
                  )}
                  <th rowSpan="2">Cash</th>
                  {patrimonyTypesArray.map((type) => (
                    <th key={`total-${type}`} rowSpan="2">
                      Total{" "}
                      {type
                        .split("_")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </th>
                  ))}
                  <th rowSpan="2">Total Patrimony</th>
                </tr>
                <tr>
                  {Object.keys(scenarioData.patrimony.placements).map(
                    (placementId) => {
                      const patrimonyTypes = Object.keys(
                        scenarioData.patrimony.placements[placementId]
                      ).filter((key) =>
                        Array.isArray(
                          scenarioData.patrimony.placements[placementId][key]
                        )
                      );
                      return (
                        <React.Fragment key={`header-${placementId}`}>
                          <th key={`${placementId}-cashflow`}>Cash Flow</th>
                          {patrimonyTypes.map((type) => (
                            <th key={`${placementId}-${type}`}>
                              {type
                                .split("_")
                                .map(
                                  (word) =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                )
                                .join(" ")}
                            </th>
                          ))}
                        </React.Fragment>
                      );
                    }
                  )}
                </tr>
              </thead>
              <tbody>
                {scenarioData.dates.map((date, index) => (
                  <tr key={date}>
                    <td>{date}</td>
                    <td>
                      {(
                        (scenarioData.cash_flows.situation.initial_deposit[
                          index
                        ] || 0) +
                        (scenarioData.cash_flows.situation.monthly_deposit[
                          index
                        ] || 0)
                      ).toLocaleString("fr-FR", {
                        maximumFractionDigits: 0,
                      })}{" "}
                      €
                    </td>
                    {Object.keys(scenarioData.patrimony.placements).map(
                      (placementId) => {
                        const patrimonyTypes = Object.keys(
                          scenarioData.patrimony.placements[placementId]
                        ).filter((key) =>
                          Array.isArray(
                            scenarioData.patrimony.placements[placementId][key]
                          )
                        );
                        return (
                          <React.Fragment key={`row-${placementId}`}>
                            <td key={`${placementId}-cashflow`}>
                              {(
                                scenarioData.cash_flows.placements[placementId][
                                  index
                                ] || 0
                              ).toLocaleString("fr-FR", {
                                maximumFractionDigits: 0,
                              })}{" "}
                              €
                            </td>
                            {patrimonyTypes.map((type) => (
                              <td key={`${placementId}-${type}`}>
                                {(
                                  scenarioData.patrimony.placements[
                                    placementId
                                  ][type][index] || 0
                                ).toLocaleString("fr-FR", {
                                  maximumFractionDigits: 0,
                                })}{" "}
                                €
                              </td>
                            ))}
                          </React.Fragment>
                        );
                      }
                    )}
                    <td>
                      {(scenarioData.patrimony.cash[index] || 0).toLocaleString(
                        "fr-FR",
                        {
                          maximumFractionDigits: 0,
                        }
                      )}{" "}
                      €
                    </td>
                    {patrimonyTypesArray.map((type) => (
                      <td key={`total-${type}-${index}`}>
                        {calculateTotalByType(type, index).toLocaleString(
                          "fr-FR",
                          {
                            maximumFractionDigits: 0,
                          }
                        )}{" "}
                        €
                      </td>
                    ))}
                    <td>
                      <strong>
                        {calculateGlobalTotal(index).toLocaleString("fr-FR", {
                          maximumFractionDigits: 0,
                        })}{" "}
                        €
                      </strong>
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

export default scenarioDataModal;

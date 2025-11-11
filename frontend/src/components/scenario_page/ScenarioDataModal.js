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

  // Validate that all selected types have corresponding data
  const validTypes = selectedTypes.filter(
    (type) =>
      scenarioData.patrimony[type] &&
      Array.isArray(scenarioData.patrimony[type]) &&
      scenarioData.dates.length === scenarioData.patrimony[type].length
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

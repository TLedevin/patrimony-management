import React from "react";
import "./ScenarioDataModal.css";

function scenarioDataEnrichedModal({
  isOpen,
  onClose,
  scenarioDataEnriched,
  selectedTypes,
}) {
  if (
    !isOpen ||
    !scenarioDataEnriched ||
    !scenarioDataEnriched.dates ||
    !scenarioDataEnriched.patrimony
  )
    return null;

  // Validate that all selected types have corresponding data
  const validTypes = selectedTypes.filter(
    (type) =>
      scenarioDataEnriched.patrimony[type] &&
      Array.isArray(scenarioDataEnriched.patrimony[type]) &&
      scenarioDataEnriched.dates.length ===
        scenarioDataEnriched.patrimony[type].length
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
                  <th rowSpan="2">Cash</th>
                  {Object.keys(scenarioDataEnriched.patrimony.investments).map(
                    (investmentId) => {
                      const patrimonyTypes = Object.keys(
                        scenarioDataEnriched.patrimony.investments[investmentId]
                      ).filter((key) =>
                        Array.isArray(
                          scenarioDataEnriched.patrimony.investments[
                            investmentId
                          ][key]
                        )
                      );
                      return (
                        <th
                          key={investmentId}
                          colSpan={patrimonyTypes.length + 1}
                        >
                          Investment {investmentId}
                        </th>
                      );
                    }
                  )}
                </tr>
                <tr>
                  {Object.keys(scenarioDataEnriched.patrimony.investments).map(
                    (investmentId) => {
                      const patrimonyTypes = Object.keys(
                        scenarioDataEnriched.patrimony.investments[investmentId]
                      ).filter((key) =>
                        Array.isArray(
                          scenarioDataEnriched.patrimony.investments[
                            investmentId
                          ][key]
                        )
                      );
                      return (
                        <React.Fragment key={`header-${investmentId}`}>
                          <th key={`${investmentId}-cashflow`}>Cash Flow</th>
                          {patrimonyTypes.map((type) => (
                            <th key={`${investmentId}-${type}`}>
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
                {scenarioDataEnriched.dates.map((date, index) => (
                  <tr key={date}>
                    <td>{date}</td>
                    <td>
                      {(
                        scenarioDataEnriched.patrimony.cash[index] || 0
                      ).toLocaleString("fr-FR", {
                        maximumFractionDigits: 0,
                      })}{" "}
                      €
                    </td>
                    {Object.keys(
                      scenarioDataEnriched.patrimony.investments
                    ).map((investmentId) => {
                      const patrimonyTypes = Object.keys(
                        scenarioDataEnriched.patrimony.investments[investmentId]
                      ).filter((key) =>
                        Array.isArray(
                          scenarioDataEnriched.patrimony.investments[
                            investmentId
                          ][key]
                        )
                      );
                      return (
                        <React.Fragment key={`row-${investmentId}`}>
                          <td key={`${investmentId}-cashflow`}>
                            {(
                              scenarioDataEnriched.cash_flows.investments[
                                investmentId
                              ][index] || 0
                            ).toLocaleString("fr-FR", {
                              maximumFractionDigits: 0,
                            })}{" "}
                            €
                          </td>
                          {patrimonyTypes.map((type) => (
                            <td key={`${investmentId}-${type}`}>
                              {(
                                scenarioDataEnriched.patrimony.investments[
                                  investmentId
                                ][type][index] || 0
                              ).toLocaleString("fr-FR", {
                                maximumFractionDigits: 0,
                              })}{" "}
                              €
                            </td>
                          ))}
                        </React.Fragment>
                      );
                    })}
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

export default scenarioDataEnrichedModal;

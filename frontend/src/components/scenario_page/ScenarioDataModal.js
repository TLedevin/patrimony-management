import React from "react";
import "./ScenarioDataModal.css";

function scenarioDataModal({ isOpen, onClose, scenarioData }) {
  if (
    !isOpen ||
    !scenarioData ||
    !scenarioData.dates ||
    !scenarioData.patrimony
  )
    return null;

  // Collect all unique patrimony types across all financial flows
  const allPatrimonyTypes = new Set();
  Object.keys(scenarioData.patrimony.financial_flows).forEach(
    (financialFlowId) => {
      Object.keys(scenarioData.patrimony.financial_flows[financialFlowId])
        .filter(
          (key) =>
            Array.isArray(
              scenarioData.patrimony.financial_flows[financialFlowId][key]
            ) && key !== "net_real_estate"
        )
        .forEach((type) => allPatrimonyTypes.add(type));
    }
  );
  const patrimonyTypesArray = Array.from(allPatrimonyTypes);

  // Helper function to calculate total patrimony for a specific type at a given index
  const calculateTotalByType = (type, index) => {
    let total = 0;
    Object.keys(scenarioData.patrimony.financialFlows).forEach(
      (financialFlowId) => {
        if (
          scenarioData.patrimony.financialFlows[financialFlowId][type] &&
          Array.isArray(
            scenarioData.patrimony.financialFlows[financialFlowId][type]
          )
        ) {
          total +=
            scenarioData.patrimony.financialFlows[financialFlowId][type][
              index
            ] || 0;
        }
      }
    );
    return total;
  };

  // Helper function to calculate global total patrimony at a given index
  const calculateGlobalTotal = (index) => {
    let total = 0;

    // Add all patrimony from financial flows
    Object.keys(scenarioData.patrimony.financial_flows).forEach(
      (financialFlowId) => {
        Object.keys(scenarioData.patrimony.financial_flows[financialFlowId])
          .filter(
            (key) =>
              Array.isArray(
                scenarioData.patrimony.financial_flows[financialFlowId][key]
              ) && key !== "net_real_estate"
          )
          .forEach((type) => {
            total +=
              scenarioData.patrimony.financial_flows[financialFlowId][type][
                index
              ] || 0;
          });
      }
    );

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
                  {Object.keys(scenarioData.patrimony.financial_flows).map(
                    (financialFlowId) => {
                      const patrimonyTypes = Object.keys(
                        scenarioData.patrimony.financial_flows[financialFlowId]
                      ).filter((key) =>
                        Array.isArray(
                          scenarioData.patrimony.financial_flows[
                            financialFlowId
                          ][key]
                        )
                      );
                      return (
                        <th
                          key={financialFlowId}
                          colSpan={patrimonyTypes.length + 1}
                        >
                          financialFlow {financialFlowId}
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
                  {Object.keys(scenarioData.patrimony.financial_flows).map(
                    (financialFlowId) => {
                      const patrimonyTypes = Object.keys(
                        scenarioData.patrimony.financial_flows[financialFlowId]
                      ).filter((key) =>
                        Array.isArray(
                          scenarioData.patrimony.financial_flows[
                            financialFlowId
                          ][key]
                        )
                      );
                      return (
                        <React.Fragment key={`header-${financialFlowId}`}>
                          <th key={`${financialFlowId}-cashflow`}>Cash Flow</th>
                          {patrimonyTypes.map((type) => (
                            <th key={`${financialFlowId}-${type}`}>
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
                    {Object.keys(scenarioData.patrimony.financial_flows).map(
                      (financialFlowId) => {
                        const patrimonyTypes = Object.keys(
                          scenarioData.patrimony.financial_flows[
                            financialFlowId
                          ]
                        ).filter((key) =>
                          Array.isArray(
                            scenarioData.patrimony.financial_flows[
                              financialFlowId
                            ][key]
                          )
                        );
                        return (
                          <React.Fragment key={`row-${financialFlowId}`}>
                            <td key={`${financialFlowId}-cashflow`}>
                              {(
                                scenarioData.cash_flows.financial_flows[
                                  financialFlowId
                                ][index] || 0
                              ).toLocaleString("fr-FR", {
                                maximumFractionDigits: 0,
                              })}{" "}
                              €
                            </td>
                            {patrimonyTypes.map((type) => (
                              <td key={`${financialFlowId}-${type}`}>
                                {(
                                  scenarioData.patrimony.financial_flows[
                                    financialFlowId
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

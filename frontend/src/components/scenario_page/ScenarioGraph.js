import { Line } from "react-chartjs-2";
import { useState, useMemo } from "react";
import "./ScenarioGraph.css";
import financialFlowStyles from "../../config/patrimonyGraphConfig";
import PatrimonyTypeDropdown from "./PatrimonyTypeDropdown";
import ScenarioDataModal from "./ScenarioDataModal";

function ScenarioGraph({ scenarioData }) {
  const [selectedTypes, setSelectedTypes] = useState(
    Object.keys(financialFlowStyles)
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Preprocess the flat scenarioData to extract dates and build type-value arrays
  const { dates, typeDataMap } = useMemo(() => {
    if (!scenarioData || !Array.isArray(scenarioData))
      return { dates: [], typeDataMap: {} };

    // Extract unique sorted dates
    const dates = Array.from(
      new Set(scenarioData.map((row) => row.date))
    ).sort();

    // Build a map: { type: [values per date index] }
    const typeDataMap = {};
    Object.keys(financialFlowStyles).forEach((type) => {
      typeDataMap[type] = Array(dates.length).fill(0);
    });

    scenarioData.forEach((row) => {
      const dateIdx = dates.indexOf(row.date);
      if (dateIdx !== -1 && typeDataMap[row.type] !== undefined) {
        typeDataMap[row.type][dateIdx] = row.value;
      }
    });

    return { dates, typeDataMap };
  }, [scenarioData]);

  // Compute total for selected types on the last date
  const totalValue = useMemo(() => {
    if (!dates.length) return 0;
    return Object.values(financialFlowStyles)
      .filter((style) => selectedTypes.includes(style.key))
      .reduce((sum, style) => {
        const arr = typeDataMap[style.key] || [];
        return sum + (arr[arr.length - 1] || 0);
      }, 0);
  }, [dates, typeDataMap, selectedTypes]);

  return (
    <div className="financial-flows-graph">
      {scenarioData && (
        <>
          <div className="graph-header">
            <div className="filter-container">
              <PatrimonyTypeDropdown
                options={Object.values(financialFlowStyles)}
                selectedTypes={selectedTypes}
                onChange={setSelectedTypes}
              />
              <button
                className="view-table-button"
                onClick={() => setIsModalOpen(true)}
              >
                View Table
              </button>
            </div>
            <div className="total-value">
              Total :{" "}
              {totalValue.toLocaleString("fr-FR", { maximumFractionDigits: 0 })}{" "}
              €
            </div>
          </div>
          <div className="graph-container">
            <Line
              data={{
                labels: dates,
                datasets: Object.values(financialFlowStyles)
                  .filter((style) => selectedTypes.includes(style.key))
                  .map((style) => ({
                    ...style,
                    data: typeDataMap[style.key] || Array(dates.length).fill(0),
                  })),
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: "index", intersect: false },
                plugins: {
                  filler: { propagate: true },
                  tooltip: {
                    mode: "index",
                    callbacks: {
                      label: function (context) {
                        return `${
                          context.dataset.label
                        }: ${context.parsed.y.toLocaleString("fr-FR", {
                          maximumFractionDigits: 0,
                        })} €`;
                      },
                      footer: function (tooltipItems) {
                        const total = tooltipItems.reduce(
                          (sum, item) => sum + item.parsed.y,
                          0
                        );
                        return `Total: ${total.toLocaleString("fr-FR", {
                          maximumFractionDigits: 0,
                        })} €`;
                      },
                    },
                  },
                  legend: { position: "bottom" },
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
                        return value.toLocaleString("fr-FR") + " €";
                      },
                    },
                  },
                  x: {
                    stacked: true,
                    grid: { display: false },
                    ticks: {
                      maxTicksLimit: 10,
                      autoSkip: true,
                      maxRotation: 0,
                      minRotation: 0,
                    },
                  },
                },
              }}
            />
          </div>
          <ScenarioDataModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            scenarioData={scenarioData}
          />
        </>
      )}
    </div>
  );
}

export default ScenarioGraph;

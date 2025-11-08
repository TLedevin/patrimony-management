import { Line } from "react-chartjs-2";
import { useState } from "react";
import "./ScenarioGraph.css";
import placementStyles from "../../config/patrimonyGraphConfig";
import PatrimonyTypeDropdown from "./PatrimonyTypeDropdown";
import ScenarioDataModal from "./ScenarioDataModal";

function ScenarioGraph({ scenarioData }) {
  const [selectedTypes, setSelectedTypes] = useState(
    Object.keys(placementStyles)
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="placements-graph">
      {scenarioData && (
        <>
          <div className="graph-header">
            <div className="filter-container">
              <PatrimonyTypeDropdown
                options={Object.values(placementStyles)}
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
              {Object.values(placementStyles)
                .filter((style) => selectedTypes.includes(style.key))
                .reduce((sum, style) => {
                  let value = 0;
                  if (style.key === "cash") {
                    const values = scenarioData.patrimony?.cash;
                    value = values ? values[values.length - 1] || 0 : 0;
                  } else {
                    Object.values(scenarioData.patrimony.placements).forEach(
                      (placement) => {
                        if (placement[style.key]) {
                          const values = placement[style.key];
                          value += values[values.length - 1] || 0;
                        }
                      }
                    );
                  }
                  return sum + value;
                }, 0)
                .toLocaleString("fr-FR", { maximumFractionDigits: 0 })}{" "}
              €
            </div>
          </div>
          <div className="graph-container">
            <Line
              data={{
                labels: scenarioData.dates,
                datasets: Object.values(placementStyles)
                  .filter((style) => selectedTypes.includes(style.key))
                  .map((style) => {
                    let data;
                    if (style.key === "cash") {
                      data = scenarioData.patrimony.cash;
                    } else {
                      // Aggregate all placements of this type
                      data = Array(scenarioData.dates.length).fill(0);
                      Object.values(scenarioData.patrimony.placements).forEach(
                        (placement) => {
                          if (placement[style.key]) {
                            placement[style.key].forEach((value, index) => {
                              data[index] += value;
                            });
                          }
                        }
                      );
                    }
                    return {
                      ...style,
                      data: data,
                    };
                  }),
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
                      maxTicksLimit: 10, // Limits the number of ticks displayed
                      autoSkip: true, // Automatically skips labels to prevent overlap
                      maxRotation: 0, // Keeps labels horizontal (0 degrees)
                      minRotation: 0, // Prevents rotation
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
            selectedTypes={selectedTypes}
            placementStyles={placementStyles}
          />
        </>
      )}
    </div>
  );
}

export default ScenarioGraph;

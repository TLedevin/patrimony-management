import { Line } from "react-chartjs-2";
import { useState } from "react";
import "./ScenarioGraph.css";
import investmentStyles from "../../config/investmentGraphConfig";
import PatrimonyTypeDropdown from "./PatrimonyTypeDropdown";

function ScenarioGraph({ scenarioData }) {
  const [selectedTypes, setSelectedTypes] = useState(
    Object.keys(investmentStyles)
  );
  return (
    <div className="investments-graph">
      {scenarioData && (
        <>
          <div className="graph-header">
            <div className="filter-container">
              <PatrimonyTypeDropdown
                options={Object.values(investmentStyles)}
                selectedTypes={selectedTypes}
                onChange={setSelectedTypes}
              />
            </div>
            <div className="total-value">
              Total :{" "}
              {Object.values(investmentStyles)
                .filter((style) => selectedTypes.includes(style.key))
                .reduce((sum, style) => {
                  const values = scenarioData.patrimony?.[style.key];
                  if (!values || !Array.isArray(values)) {
                    return sum;
                  }
                  return sum + (values[values.length - 1] || 0);
                }, 0)
                .toLocaleString("fr-FR")}{" "}
              €
            </div>
          </div>
          <div className="graph-container">
            <Line
              data={{
                labels: scenarioData.dates,
                datasets: Object.values(investmentStyles)
                  .filter((style) => selectedTypes.includes(style.key))
                  .map((style) => ({
                    ...style,
                    data: scenarioData.patrimony[style.key],
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
                        }: ${context.parsed.y.toLocaleString("fr-FR")} €`;
                      },
                      footer: function (tooltipItems) {
                        const total = tooltipItems.reduce(
                          (sum, item) => sum + item.parsed.y,
                          0
                        );
                        return `Total: ${total.toLocaleString("fr-FR")} €`;
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
        </>
      )}
    </div>
  );
}

export default ScenarioGraph;

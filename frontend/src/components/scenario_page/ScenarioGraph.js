import { Line } from "react-chartjs-2";
import "./ScenarioGraph.css";

function ScenarioGraph({ scenarioData }) {
  return (
    <div className="investments-graph">
      {scenarioData && (
        <>
          <div className="graph-container">
            <Line
              data={{
                labels: scenarioData.dates,
                datasets: [
                  {
                    label: "Cash",
                    data: scenarioData.patrimony.cash,
                    borderWidth: 2,
                    borderColor: "rgba(223, 81, 112, 1)",
                    backgroundColor: "rgba(223, 81, 112, 0.3)",
                    fill: true,
                    tension: 0.1,
                    stack: "stack1",
                    order: 2,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointBackgroundColor: "rgba(223, 81, 112, 1)",
                  },
                  {
                    label: "Savings",
                    data: scenarioData.patrimony.savings,
                    borderWidth: 2,
                    borderColor: "rgba(64, 164, 164, 1)",
                    backgroundColor: "rgba(64, 164, 164, 0.3)",
                    fill: true,
                    tension: 0.1,
                    stack: "stack1",
                    order: 1,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointBackgroundColor: "rgba(64, 164, 164, 1)",
                  },
                  {
                    label: "Stock exchange",
                    data: scenarioData.patrimony.stock_exchange,
                    borderWidth: 2,
                    borderColor: "rgba(66, 164, 64, 1)",
                    backgroundColor: "rgba(66, 164, 64, 0.3)",
                    fill: true,
                    tension: 0.1,
                    stack: "stack1",
                    order: 1,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointBackgroundColor: "rgba(66, 164, 64, 1)",
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: "index", intersect: false },
                plugins: {
                  filler: { propagate: true },
                  title: { display: true, text: "Total Patrimony Evolution" },
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

import { Line } from "react-chartjs-2";
import "./ScenarioGraph.css";

function ScenarioGraph({
  selectedScenario,
  investments,
  selectedInvestmentsForGraph,
  setSelectedInvestmentsForGraph,
}) {
  return (
    <div className="investments-graph">
      {selectedScenario && investments.length > 0 && (
        <>
          <div className="graph-filters">
            {investments.map((investment) => (
              <label key={investment.id} className="graph-filter-item">
                <input
                  type="checkbox"
                  checked={selectedInvestmentsForGraph[investment.id] || false}
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
                            (investment?.data?.patrimony?.savings[index] || 0)
                          );
                        }, 0);
                    }),
                    borderWidth: 2,
                    borderColor: "rgba(64, 164, 164, 1)",
                    backgroundColor: "rgba(64, 164, 164, 0.3)",
                    fill: "stack",
                    tension: 0,
                    order: 1,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointBackgroundColor: "rgba(64, 164, 164, 1)",
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
                            (investment?.data?.patrimony?.cash[index] || 0)
                          );
                        }, 0);
                    }),
                    borderWidth: 2,
                    borderColor: "rgba(223, 81, 112, 1)",
                    backgroundColor: "rgba(223, 81, 112, 0.3)",
                    fill: "stack",
                    tension: 0,
                    order: 1,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointBackgroundColor: "rgba(223, 81, 112, 1)",
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
                        return value.toFixed(2) + " €";
                      },
                    },
                  },
                  x: { stacked: true, grid: { display: false } },
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

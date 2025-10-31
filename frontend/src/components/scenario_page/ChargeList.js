import { useState } from "react";
import ModifyChargeModal from "./ModifyChargeModal";
import "./ChargeList.css";

function ChargeList({
  selectedScenario,
  charges,
  setShowAddChargeModal,
  setScenarios,
  setCharges,
  setScenarioData,
  chargeTypes,
}) {
  const [showModifyChargeModal, setShowModifyChargeModal] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState(null);
  const [chargeName, setChargeName] = useState("");
  const [chargeType, setChargeType] = useState("");
  const [chargeParams, setChargeParams] = useState({});

  const handleDeleteCharge = async (chargeId) => {
    if (!selectedScenario) {
      alert("Please select a scenario first");
      return;
    }

    if (window.confirm("Are you sure you want to delete this charge?")) {
      const response = await fetch(
        `http://localhost:5000/api/delete_charge/${selectedScenario}/${chargeId}`,
        { method: "GET" }
      );

      if (response.ok) {
        // Refresh charges list
        const scenariosResponse = await fetch(
          "http://localhost:5000/api/load_scenarios/"
        );
        const scenariosData = await scenariosResponse.json();
        const newScenarios = Object.values(scenariosData);
        setScenarios(newScenarios);
        const scenario = newScenarios.find((s) => s.id === selectedScenario);
        setCharges(Object.values(scenario.charges || {}));
      } else {
        alert("Failed to delete charge");
      }
      const scenarioData = await fetch(
        `http://localhost:5000/api/get_scenario_data/?scenario_id=${selectedScenario}`
      );
      if (!scenarioData.ok) {
        throw new Error(`HTTP error! status: ${scenarioData.status}`);
      }
      const data = await scenarioData.json();
      console.log("Fetched scenario data:", data);
      setScenarioData(data);
    }
  };

  return (
    <div className="charges-list">
      <div className="charges-header">
        <button
          className="add-charge-btn"
          onClick={() => {
            if (!selectedScenario) {
              alert("Please select a scenario before adding a charge");
              return;
            }
            setShowAddChargeModal(true);
          }}
        >
          <span>+</span> Add Charge
        </button>
      </div>
      <div className="charges-content">
        {selectedScenario ? (
          charges?.length > 0 ? (
            <div className="charges-grid">
              {charges.map((charge) => (
                <div
                  key={charge.id}
                  className="charge-card"
                  onClick={() => {
                    setSelectedCharge(charge);
                    setChargeName(charge.name);
                    setChargeType(charge.type);
                    setChargeParams(charge.parameters);
                    setShowModifyChargeModal(true);
                  }}
                >
                  <div className="charge-icon">💸</div>
                  <div className="charge-info">
                    <h3 className="charge-name">{charge.name}</h3>
                    <span className="charge-id">#{charge.id}</span>
                  </div>
                  <button
                    className="delete-charge-btn"
                    title="Delete charge"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCharge(charge.id);
                    }}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-charges-message">
              No charges found for this scenario.
            </p>
          )
        ) : (
          <p className="no-charges-message">
            Please select a scenario to view charges.
          </p>
        )}
      </div>
      {showModifyChargeModal && selectedCharge && (
        <ModifyChargeModal
          charge={selectedCharge}
          setChargeType={setChargeType}
          chargeName={chargeName}
          setChargeName={setChargeName}
          chargeParams={chargeParams}
          chargeType={chargeType}
          chargeTypes={chargeTypes}
          setChargeParams={setChargeParams}
          setShowModifyChargeModal={setShowModifyChargeModal}
          selectedScenario={selectedScenario}
          setScenarios={setScenarios}
          setCharges={setCharges}
          setScenarioData={setScenarioData}
        />
      )}
    </div>
  );
}

export default ChargeList;

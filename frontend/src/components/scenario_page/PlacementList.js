import { useState } from "react";
import ModifyplacementModal from "./ModifyPlacementModal";
import "./PlacementList.css";

function PlacementList({
  selectedScenario,
  placements,
  setShowAddPlacementModal,
  setScenarios,
  setPlacements,
  setScenarioData,
  placementTypes,
}) {
  const [showModifyPlacementModal, setShowModifyPlacementModal] =
    useState(false);
  const [selectedPlacement, setSelectedPlacement] = useState(null);
  const [placementName, setPlacementName] = useState("");
  const [placementType, setPlacementType] = useState("");
  const [placementSubType, setPlacementSubType] = useState("");
  const [placementParams, setPlacementParams] = useState({});
  const handleDeleteplacement = async (placementId) => {
    if (!selectedScenario) {
      alert("Please select a scenario first");
      return;
    }

    if (window.confirm("Are you sure you want to delete this placement?")) {
      const response = await fetch(
        `http://localhost:5000/api/delete_placement/${selectedScenario}/${placementId}`,
        { method: "GET" }
      );

      if (response.ok) {
        // Refresh placements list
        const scenariosResponse = await fetch(
          "http://localhost:5000/api/load_scenarios/"
        );
        const scenariosData = await scenariosResponse.json();
        const newScenarios = Object.values(scenariosData);
        setScenarios(newScenarios);
        const scenario = newScenarios.find((s) => s.id === selectedScenario);
        setPlacements(Object.values(scenario.placements));
      } else {
        alert("Failed to delete placement");
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
    <div className="placements-list">
      <div className="placements-header">
        <button
          className="add-placement-btn"
          onClick={() => {
            if (!selectedScenario) {
              alert("Please select a scenario before adding a placement");
              return;
            }
            setShowAddPlacementModal(true);
          }}
        >
          <span>+</span> Add placement
        </button>
      </div>
      <div className="placements-content">
        {selectedScenario ? (
          placements.length > 0 ? (
            <div className="placements-grid">
              {placements.map((placement) => (
                <div
                  key={placement.id}
                  className={`placement-card ${placement.type}`}
                  onClick={() => {
                    setSelectedPlacement(placement);
                    setPlacementName(placement.name);
                    setPlacementType(placement.type);
                    setPlacementSubType(placement.subtype);
                    setPlacementParams(placement.parameters);
                    setShowModifyPlacementModal(true);
                  }}
                >
                  <div className="placement-icon">
                    {placementTypes[placement.type]?.[placement.subtype]
                      ?.icon || "💰"}
                  </div>
                  <div className="placement-info">
                    <h3 className="placement-type">
                      {
                        placementTypes[placement.type]?.[placement.subtype]
                          ?.label
                      }
                    </h3>
                    <span className="placement-name">{placement.name}</span>
                  </div>
                  <button
                    className="delete-placement-btn"
                    title="Delete placement"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click when clicking delete
                      handleDeleteplacement(placement.id);
                    }}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-placements-message">
              No placements found for this scenario.
            </p>
          )
        ) : (
          <p className="no-placements-message">
            Please select a scenario to view placements.
          </p>
        )}
      </div>
      {showModifyPlacementModal && selectedPlacement && (
        <ModifyplacementModal
          placement={selectedPlacement}
          setPlacementType={setPlacementType}
          placementName={placementName}
          setPlacementName={setPlacementName}
          placementParams={placementParams}
          placementType={placementType}
          placementTypes={placementTypes}
          setPlacementParams={setPlacementParams}
          placementSubType={placementSubType}
          setPlacementSubType={setPlacementSubType}
          setShowModifyPlacementModal={setShowModifyPlacementModal}
          selectedScenario={selectedScenario}
          setScenarios={setScenarios}
          setPlacements={setPlacements}
          setScenarioData={setScenarioData}
        />
      )}
    </div>
  );
}

export default PlacementList;

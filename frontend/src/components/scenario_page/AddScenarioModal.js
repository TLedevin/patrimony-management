function AddScenarioModal({
  newScenarioName,
  setNewScenarioName,
  setShowAddScenarioModal,
  setScenarios,
  setInvestments,
  setSelectedScenario,
}) {
  const handleAddScenario = async () => {
    if (newScenarioName.trim() === "") {
      alert("Please enter a scenario name");
      return;
    }

    const response = await fetch(
      `http://localhost:5000/api/add_scenario?name=${newScenarioName}`,
      { method: "GET" }
    );

    const result = await response.json();
    console.log("Scenario added:", result);

    // Refresh scenarios list
    const scenariosResponse = await fetch(
      "http://localhost:5000/api/load_scenarios/"
    );
    const scenariosData = await scenariosResponse.json();
    setScenarios(Object.values(scenariosData));
    setInvestments([]);

    // Reset modal state
    setShowAddScenarioModal(false);
    setNewScenarioName("");
    setSelectedScenario(result);
  };

  const handleModalClose = () => {
    setShowAddScenarioModal(false);
    setNewScenarioName("");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Add New Scenario</h3>
        <input
          type="text"
          value={newScenarioName}
          onChange={(e) => setNewScenarioName(e.target.value)}
          placeholder="Enter scenario name"
          className="name-input"
          autoFocus
        />
        <div className="modal-buttons">
          <button onClick={handleAddScenario} className="btn-confirm">
            Add
          </button>
          <button onClick={handleModalClose} className="btn-cancel">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddScenarioModal;

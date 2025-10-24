import { useState, useRef, useEffect } from "react";
import "./PatrimonyTypeDropdown.css";

function PatrimonyTypeDropdown({ options, selectedTypes, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCheckboxChange = (key) => {
    const updatedSelection = selectedTypes.includes(key)
      ? selectedTypes.filter((type) => type !== key)
      : [...selectedTypes, key];
    onChange(updatedSelection);
  };

  return (
    <div className="patrimony-dropdown" ref={dropdownRef}>
      <div
        className={`dropdown-header ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        Select Patrimony Types
        <span className="dropdown-arrow">{isOpen ? "▼" : "▶"}</span>
      </div>
      {isOpen && (
        <div className="dropdown-content">
          {options.map((option) => (
            <label key={option.key} className="checkbox-item">
              <input
                type="checkbox"
                checked={selectedTypes.includes(option.key)}
                onChange={() => handleCheckboxChange(option.key)}
              />
              {option.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default PatrimonyTypeDropdown;

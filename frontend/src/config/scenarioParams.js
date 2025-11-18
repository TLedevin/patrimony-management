const currentDate = new Date();
const currentYear = currentDate.getFullYear();

const scenarioParams = [
  {
    id: "start_year",
    label: "Start Year",
    type: "number",
    min: currentYear,
    step: 1,
    className: "scenario-parameter-input",
  },
  {
    id: "start_month",
    label: "Start Month",
    type: "number",
    min: 1,
    max: 12,
    step: 1,
    className: "scenario-parameter-input",
  },
  {
    id: "end_year",
    label: "End Year",
    type: "number",
    min: currentYear,
    step: 1,
    className: "scenario-parameter-input",
  },
  {
    id: "end_month",
    label: "End Month",
    type: "number",
    min: 0,
    max: 12,
    step: 1,
    className: "scenario-parameter-input",
  },
];

export default scenarioParams;

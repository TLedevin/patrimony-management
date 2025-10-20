const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11

export const investmentTypes = {
  saving_account: {
    label: "Saving Account",
    parameters: [
      {
        id: "yearly_interest_rate",
        label: "Yearly Interest Rate (%)",
        type: "number",
        required: true,
        min: 0,
        max: 100,
        step: 0.1,
      },
      {
        id: "start_year",
        label: "Start Year",
        type: "number",
        required: true,
        min: currentYear,
        max: currentYear + 5,
        step: 1,
      },

      {
        id: "start_month",
        label: "Start Month",
        type: "number",
        required: true,
        min: 1,
        max: 12,
        step: 1,
      },
      {
        id: "end_year",
        label: "End Year",
        type: "number",
        required: true,
        min: currentYear + 1,
        max: currentYear + 5,
        step: 1,
        validate: (formData) => {
          if (formData.start_year >= formData.end_year) {
            return `End year must be greater than start year`;
          }
          return true;
        },
      },
      {
        id: "end_month",
        label: "End Month",
        type: "number",
        required: true,
        min: 1,
        max: 12,
        step: 1,
      },
      {
        id: "initial_investment",
        label: "Initial Investment (€)",
        type: "number",
        required: false,
        min: 0,
        step: 100,
        default: 0,
      },
    ],
  },
  // Add more investment types here as needed
};

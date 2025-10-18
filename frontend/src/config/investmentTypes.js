export const investmentTypes = {
  saving_account: {
    label: "Saving Account",
    parameters: [
      {
        id: "interest_rate",
        label: "Interest Rate (%)",
        type: "number",
        required: true,
        min: 0,
        max: 100,
        step: 0.1,
      },
      {
        id: "duration",
        label: "Duration (years)",
        type: "number",
        required: true,
        min: 1,
        step: 1,
      },
      {
        id: "initial_amount",
        label: "Initial Amount (€)",
        type: "number",
        required: true,
        min: 0,
        step: 100,
      },
      {
        id: "monthly_deposit",
        label: "Monthly Deposit (€)",
        type: "number",
        required: false,
        min: 0,
        step: 10,
        default: 0,
      },
    ],
  },
  // Add more investment types here as needed
};

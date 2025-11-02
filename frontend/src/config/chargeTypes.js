const currentDate = new Date();
const currentYear = currentDate.getFullYear();

export const chargeTypes = {
  rental_personal_use: {
    id: "rental_personal_use",
    label: "Rental (PR)",
    parameters: [
      {
        id: "rent_including_charges",
        label: "Rent including Charges",
        type: "number",
        required: true,
        min: 0,
        step: 10,
      },
      {
        id: "start_year",
        label: "Start Year",
        type: "number",
        required: true,
        min: currentYear,
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
    ],
  },
  // Add more charge types here as needed
};

export default chargeTypes;

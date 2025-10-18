import numpy as np


def generate_saving_account_data(parameters: dict) -> dict:
    monthly_rate = np.exp(1 / 12 * np.log(1 + parameters["yearly_rate"])) - 1

    simulation_duration = (
        (parameters["simulation_end_year"] - parameters["start_year"]) * 12
        + parameters["simulation_end_month"]
        - parameters["start_month"]
    )

    investment_duration = (
        (parameters["end_year"] - parameters["start_year"]) * 12
        + parameters["end_month"]
        - parameters["start_month"]
    )

    cash_flows = [-parameters["initial_investment"]]
    patrimony = {}
    patrimony["cash"] = [0]
    patrimony["savings"] = [parameters["initial_investment"]]

    for month in range(1, simulation_duration):
        if month < investment_duration:
            patrimony["cash"].append(0)
            patrimony["savings"].append(
                patrimony["savings"][-1] * (1 + monthly_rate)
            )
            cash_flows.append(0)

        elif month == investment_duration:
            cash_flows.append(patrimony["savings"][-1] * (1 + monthly_rate))
            patrimony["cash"].append(cash_flows[-1])
            patrimony["savings"].append(0)

        else:
            patrimony["savings"].append(0)
            patrimony["cash"].append(patrimony["cash"][-1])
            cash_flows.append(0)

    return {"cash_flows": cash_flows, "patrimony": patrimony}

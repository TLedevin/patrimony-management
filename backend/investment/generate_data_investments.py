import numpy as np
from settings import conf


def generate_saving_account_data(parameters: dict) -> dict:
    monthly_rate = (
        np.exp(
            1
            / 12
            * np.log(1 + float(parameters["yearly_interest_rate"]) / 100)
        )
        - 1
    )

    simulation_duration = (
        (conf["simulation_end_year"] - conf["simulation_start_year"]) * 12
        + conf["simulation_end_month"]
        - conf["simulation_start_month"]
    )

    investment_duration = (
        (int(parameters["end_year"]) - int(parameters["start_year"])) * 12
        + int(parameters["end_month"])
        - int(parameters["start_month"])
    )

    start_month = (
        (int(parameters["start_year"]) - conf["simulation_start_year"]) * 12
        + int(parameters["start_month"])
        - conf["simulation_start_month"]
    )

    cash_flows = []
    patrimony = {}
    patrimony["cash"] = []
    patrimony["savings"] = []

    for month in range(simulation_duration):
        if month < start_month:
            cash_flows.append(0)
            patrimony["cash"].append(float(parameters["initial_investment"]))
            patrimony["savings"].append(0)

        elif month == start_month:
            cash_flows.append(-float(parameters["initial_investment"]))
            patrimony["cash"].append(0)
            patrimony["savings"].append(
                float(parameters["initial_investment"])
            )

        elif month < start_month + investment_duration:
            cash_flows.append(0)
            patrimony["cash"].append(0)
            patrimony["savings"].append(
                patrimony["savings"][-1] * (1 + monthly_rate)
            )

        elif month == start_month + investment_duration:
            cash_flows.append(patrimony["savings"][-1] * (1 + monthly_rate))
            patrimony["cash"].append(cash_flows[-1])
            patrimony["savings"].append(0)

        else:
            patrimony["savings"].append(0)
            patrimony["cash"].append(patrimony["cash"][-1])
            cash_flows.append(0)

    dates = [
        f"{conf['simulation_start_year'] + (month // 12)}-{(month % 12) + 1:02d}-01"
        for month in range(simulation_duration)
    ]

    return {"cash_flows": cash_flows, "patrimony": patrimony, "dates": dates}

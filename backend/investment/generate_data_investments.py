import numpy as np
from scenario.scenario_management import load_scenarios


def generate_saving_account_data(scenario_id: int, parameters: dict) -> dict:
    scenario = load_scenarios()[str(scenario_id)]
    print(scenario.keys())
    end_year = int(scenario["end_year"])
    start_year = int(scenario["start_year"])
    end_month = int(scenario["end_month"])
    start_month = int(scenario["start_month"])

    monthly_rate = (
        np.exp(
            1
            / 12
            * np.log(1 + float(parameters["yearly_interest_rate"]) / 100)
        )
        - 1
    )

    simulation_duration = (
        (end_year - start_year) * 12 + end_month - start_month
    )

    print(simulation_duration)

    investment_duration = (
        (int(parameters["end_year"]) - int(parameters["start_year"])) * 12
        + int(parameters["end_month"])
        - int(parameters["start_month"])
    )

    start_month = (
        (int(parameters["start_year"]) - start_year) * 12
        + int(parameters["start_month"])
        - start_month
    )

    cash_flows = []
    patrimony = {}
    patrimony["savings"] = []

    for month in range(simulation_duration):
        if month < start_month:
            cash_flows.append(0)
            patrimony["savings"].append(0)

        elif month == start_month:
            cash_flows.append(-float(parameters["initial_investment"]))
            patrimony["savings"].append(
                float(parameters["initial_investment"])
            )

        elif month < start_month + investment_duration:
            cash_flows.append(0)
            patrimony["savings"].append(
                patrimony["savings"][-1] * (1 + monthly_rate)
            )

        elif month == start_month + investment_duration:
            cash_flows.append(patrimony["savings"][-1])
            patrimony["savings"].append(0)

        else:
            patrimony["savings"].append(0)
            cash_flows.append(0)

    return {"cash_flows": cash_flows, "patrimony": patrimony}

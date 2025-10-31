import json

from settings import conf


def load_scenario_data(scenario_id: int) -> dict:
    data_path = conf["paths"]["data"]
    with open(data_path + "scenarios/scenarios.json", "r") as f:
        scenario = json.load(f)[str(scenario_id)]

    end_year = int(scenario["end_year"])
    start_year = int(scenario["start_year"])
    end_month = int(scenario["end_month"])
    start_month = int(scenario["start_month"])

    return end_year, start_year, end_month, start_month


def generate_personal_use_rental_data(scenario_id: int, parameters: dict):
    end_year, start_year, end_month, start_month = load_scenario_data(
        scenario_id
    )

    simulation_duration = (
        (end_year - start_year) * 12 + end_month - start_month
    )

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

    for month in range(simulation_duration):
        if month < start_month:
            cash_flows.append(0)

        elif month <= start_month + investment_duration:
            cash_flows.append(-float(parameters["rent_including_charges"]))

        else:
            cash_flows.append(0)

    return {"cash_flows": cash_flows, "patrimony": {}}

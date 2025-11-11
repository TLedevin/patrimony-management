import json

from settings import conf


def load_scenario_dates(scenario_id: int) -> dict:
    data_path = conf["paths"]["data"]
    with open(data_path + "scenarios/scenarios.json", "r") as f:
        scenario = json.load(f)[str(scenario_id)]

    end_year = int(scenario["end_year"])
    start_year = int(scenario["start_year"])
    end_month = int(scenario["end_month"])
    start_month = int(scenario["start_month"])

    return end_year, start_year, end_month, start_month

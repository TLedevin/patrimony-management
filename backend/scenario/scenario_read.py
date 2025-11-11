import json
import os

from settings import conf


def initialize_scenarios_files():
    data_path = conf["paths"]["data"]

    if not os.path.exists(data_path + "scenarios/"):
        os.makedirs(data_path + "scenarios/")

    if not os.path.exists(data_path + "scenarios/scenarios.json"):
        with open(data_path + "scenarios/scenarios.json", "w") as f:
            json.dump({}, f)


def load_scenarios():
    initialize_scenarios_files()
    data_path = conf["paths"]["data"]
    with open(data_path + "scenarios/scenarios.json", "r") as f:
        scenarios = json.load(f)
    return scenarios


def load_scenario_dates(scenario_id: int) -> dict:
    data_path = conf["paths"]["data"]
    with open(data_path + "scenarios/scenarios.json", "r") as f:
        scenario = json.load(f)[str(scenario_id)]

    end_year = int(scenario["end_year"])
    start_year = int(scenario["start_year"])
    end_month = int(scenario["end_month"])
    start_month = int(scenario["start_month"])

    return end_year, start_year, end_month, start_month


def load_scenario_data(scenario_id: int):
    data_path = conf["paths"]["data"]
    with open(
        f"{data_path}scenarios/{scenario_id}/scenario_data.json",
        "r",
    ) as f:
        scenario_data = json.load(f)
    return scenario_data


def load_placement(scenario_id: int, placement_id: int):
    data_path = conf["paths"]["data"]
    with open(
        f"{data_path}scenarios/{scenario_id}/{placement_id}.json",
        "r",
    ) as f:
        placement = json.load(f)
    return placement

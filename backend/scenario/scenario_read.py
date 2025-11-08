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


def load_placement(scenario_id: int, placement_id: int):
    data_path = conf["paths"]["data"]
    with open(
        f"{data_path}scenarios/{scenario_id}/{placement_id}.json",
        "r",
    ) as f:
        placement = json.load(f)
    return placement

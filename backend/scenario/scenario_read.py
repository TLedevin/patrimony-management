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


def load_investment(scenario_id: int, investment_id: int):
    data_path = conf["paths"]["data"]
    with open(
        f"{data_path}scenarios/{scenario_id}/{investment_id}.json",
        "r",
    ) as f:
        investment = json.load(f)
    return investment


def load_charge(scenario_id: int, charge_id: int):
    data_path = conf["paths"]["data"]
    with open(
        f"{data_path}scenarios/charges/{scenario_id}/{charge_id}.json",
        "r",
    ) as f:
        charge = json.load(f)
    return charge

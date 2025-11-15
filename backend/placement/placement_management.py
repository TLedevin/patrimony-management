import json
import os

from placement.generate_placement_data import generate_placement_data
from scenario.scenario_management import build_scenario_data
from settings import conf


def generate_placement_id(scenario_id: int):
    data_path = conf["paths"]["data"]
    with open(data_path + "scenarios/scenarios.json", "r") as f:
        scenarios = json.load(f)
    if scenarios:
        existing_id = [
            int(i) for i in scenarios[str(scenario_id)]["placements"].keys()
        ]
        if len(existing_id) > 0:

            id_range = range(1, max(existing_id) + 1)
            for i in id_range:
                if int(i) not in existing_id:
                    return int(i)
            return max(id_range) + 1
    return 1


def add_placement(
    scenario_id: int,
    name: str,
    type: str,
    subtype: str,
    parameters: dict,
) -> int:
    data_path = conf["paths"]["data"]
    placement_id = generate_placement_id(scenario_id)

    with open(data_path + "scenarios/scenarios.json", "r+") as f:
        scenarios = json.load(f)
        scenarios[str(scenario_id)]["placements"][placement_id] = {
            "id": placement_id,
            "name": name,
            "type": type,
            "subtype": subtype,
            "parameters": parameters,
        }
        f.seek(0)
        json.dump(scenarios, f, indent=4)
        f.truncate()

    df = generate_placement_data(type, subtype, parameters)
    df.to_csv(
        f"{data_path}scenarios/{scenario_id}/{placement_id}.csv", index=False
    )

    build_scenario_data(scenario_id)

    return placement_id


def modify_placement(
    scenario_id: int,
    placement_id: int,
    name: str,
    type: str,
    subtype: str,
    parameters: dict,
):
    data_path = conf["paths"]["data"]

    with open(data_path + "scenarios/scenarios.json", "r+") as f:
        scenarios = json.load(f)

        scenarios[str(scenario_id)]["placements"][str(placement_id)] = {
            "id": placement_id,
            "name": name,
            "type": type,
            "subtype": subtype,
            "parameters": parameters,
        }

        f.seek(0)
        json.dump(scenarios, f, indent=4)
        f.truncate()

    df = generate_placement_data(type, subtype, parameters)
    df.to_csv(f"{data_path}scenarios/{scenario_id}/{placement_id}.csv")

    build_scenario_data(scenario_id)

    return placement_id


def delete_placement(scenario_id: int, placement_id: int):
    data_path = conf["paths"]["data"]
    with open(data_path + "scenarios/scenarios.json", "r+") as f:
        scenarios = json.load(f)
        if str(placement_id) in scenarios[scenario_id]["placements"]:
            del scenarios[scenario_id]["placements"][str(placement_id)]
            f.seek(0)
            json.dump(scenarios, f, indent=4)
            f.truncate()

            os.remove(f"{data_path}scenarios/{scenario_id}/{placement_id}.csv")

    build_scenario_data(scenario_id)

import json
import os

from placement.generate_charge_data import generate_personal_use_rental_data
from placement.generate_investment_data import (
    generate_real_estate_data,
    generate_rental_placement_data,
    generate_saving_account_data,
    generate_stock_exchange_data,
)
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


def generate_placement_data(
    scenario_id: int, type: str, subtype: str, parameters: dict
) -> dict:
    mapping_placement_types = {
        "investment": {
            "saving_account": generate_saving_account_data,
            "stock_exchange": generate_stock_exchange_data,
            "real_estate": generate_real_estate_data,
            "rental_investment": generate_rental_placement_data,
        },
        "charges": {
            "rental_personal_use": generate_personal_use_rental_data,
        },
    }
    print("####", type, subtype)
    return mapping_placement_types[type][subtype](scenario_id, parameters)


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

    data = generate_placement_data(scenario_id, type, subtype, parameters)

    with open(
        f"{data_path}scenarios/{scenario_id}/{placement_id}.json",
        "w",
    ) as f:
        json.dump(data, f, indent=4)

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

    data = generate_placement_data(scenario_id, type, subtype, parameters)

    with open(
        f"{data_path}scenarios/{scenario_id}/{placement_id}.json", "r+"
    ) as f:
        f.seek(0)
        json.dump(data, f, indent=4)
        f.truncate()

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

            os.remove(
                f"{data_path}scenarios/{scenario_id}/{placement_id}.json"
            )

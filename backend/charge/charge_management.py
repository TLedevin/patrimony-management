import json

from charge.generate_data_charges import generate_personal_use_rental_data
from settings import conf


def generate_charge_id(scenario_id: int):
    data_path = conf["paths"]["data"]
    with open(data_path + "scenarios/scenarios.json", "r") as f:
        scenarios = json.load(f)
    if scenarios:
        existing_id = [
            int(i) for i in scenarios[str(scenario_id)]["charges"].keys()
        ]
        if len(existing_id) > 0:

            id_range = range(1, max(existing_id) + 1)
            for i in id_range:
                if int(i) not in existing_id:
                    return int(i)
            return max(id_range) + 1
    return 1


def generate_charge_data(
    scenario_id: int, type: str, parameters: dict
) -> dict:
    mapping_charge_types = {
        "rental_personal_use": generate_personal_use_rental_data,
    }

    return mapping_charge_types[type](scenario_id, parameters)


def add_charge(
    scenario_id: int,
    name: str,
    type: str,
    parameters: dict,
) -> int:
    data_path = conf["paths"]["data"]
    charge_id = generate_charge_id(scenario_id)
    data = generate_charge_data(scenario_id, type, parameters)

    with open(data_path + "scenarios/scenarios.json", "r+") as f:
        scenarios = json.load(f)
        scenarios[str(scenario_id)]["charges"][charge_id] = {
            "id": charge_id,
            "name": name,
            "type": type,
            "parameters": parameters,
            "data": data,
        }
        f.seek(0)
        json.dump(scenarios, f, indent=4)
        f.truncate()
    return charge_id


def modify_charge(
    scenario_id: int,
    charge_id: int,
    name: str,
    type: str,
    parameters: dict,
):
    data_path = conf["paths"]["data"]

    with open(data_path + "scenarios/scenarios.json", "r+") as f:
        scenarios = json.load(f)

        data = generate_charge_data(scenario_id, type, parameters)

        scenarios[str(scenario_id)]["charges"][str(charge_id)] = {
            "id": charge_id,
            "name": name,
            "type": type,
            "parameters": parameters,
            "data": data,
        }

        f.seek(0)
        json.dump(scenarios, f, indent=4)
        f.truncate()

    return charge_id


def delete_charge(scenario_id: int, charge_id: int):
    data_path = conf["paths"]["data"]
    with open(data_path + "scenarios/scenarios.json", "r+") as f:
        scenarios = json.load(f)
        if str(charge_id) in scenarios[scenario_id]["charges"]:
            del scenarios[scenario_id]["charges"][str(charge_id)]
            f.seek(0)
            json.dump(scenarios, f, indent=4)
            f.truncate()

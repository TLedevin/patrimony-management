import json

from investment.generate_data_investments import (
    generate_real_estate_data,
    generate_saving_account_data,
    generate_stock_exchange_data,
)
from settings import conf


def generate_investment_id(scenario_id: int):
    data_path = conf["paths"]["data"]
    with open(data_path + "scenarios/scenarios.json", "r") as f:
        scenarios = json.load(f)
    if scenarios:
        existing_id = [
            int(i) for i in scenarios[str(scenario_id)]["investments"].keys()
        ]
        if len(existing_id) > 0:

            id_range = range(1, max(existing_id) + 1)
            for i in id_range:
                if int(i) not in existing_id:
                    return int(i)
            return max(id_range) + 1
    return 1


def generate_investment_data(
    scenario_id: int, type: str, parameters: dict
) -> dict:
    mapping_investment_types = {
        "saving_account": generate_saving_account_data,
        "stock_exchange": generate_stock_exchange_data,
        "real_estate": generate_real_estate_data,
    }

    return mapping_investment_types[type](scenario_id, parameters)


def add_investment(
    scenario_id: int,
    name: str,
    type: str,
    parameters: dict,
) -> int:
    data_path = conf["paths"]["data"]
    investment_id = generate_investment_id(scenario_id)
    data = generate_investment_data(scenario_id, type, parameters)

    with open(data_path + "scenarios/scenarios.json", "r+") as f:
        scenarios = json.load(f)
        scenarios[str(scenario_id)]["investments"][investment_id] = {
            "id": investment_id,
            "name": name,
            "type": type,
            "parameters": parameters,
            "data": data,
        }
        f.seek(0)
        json.dump(scenarios, f)
        f.truncate()
    return investment_id


def modify_investment(
    scenario_id: int,
    investment_id: int,
    name: str,
    type: str,
    parameters: dict,
):
    data_path = conf["paths"]["data"]

    with open(data_path + "scenarios/scenarios.json", "r+") as f:
        scenarios = json.load(f)

        data = generate_investment_data(scenario_id, type, parameters)

        scenarios[str(scenario_id)]["investments"][str(investment_id)] = {
            "id": investment_id,
            "name": name,
            "type": type,
            "parameters": parameters,
            "data": data,
        }

        f.seek(0)
        json.dump(scenarios, f)
        f.truncate()

    return investment_id


def delete_investment(scenario_id: int, investment_id: int):
    data_path = conf["paths"]["data"]
    with open(data_path + "scenarios/scenarios.json", "r+") as f:
        scenarios = json.load(f)
        if str(investment_id) in scenarios[scenario_id]["investments"]:
            del scenarios[scenario_id]["investments"][str(investment_id)]
            f.seek(0)
            json.dump(scenarios, f)
            f.truncate()
            f.seek(0)
            json.dump(scenarios, f)
            f.truncate()

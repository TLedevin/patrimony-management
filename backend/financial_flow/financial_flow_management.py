import json
import os

from financial_flow.generate_financial_flow_data import (
    generate_financial_flow_data,
)
from scenario.scenario_management import build_scenario_data
from settings import conf


def generate_financial_flow_id(scenario_id: int):
    data_path = conf["paths"]["data"]
    with open(data_path + "scenarios/scenarios.json", "r") as f:
        scenarios = json.load(f)
    if scenarios:
        existing_id = [
            int(i)
            for i in scenarios[str(scenario_id)]["financial_flows"].keys()
        ]
        if len(existing_id) > 0:

            id_range = range(1, max(existing_id) + 1)
            for i in id_range:
                if int(i) not in existing_id:
                    return int(i)
            return max(id_range) + 1
    return 1


def add_financial_flow(
    scenario_id: int,
    name: str,
    type: str,
    subtype: str,
    parameters: dict,
) -> int:
    data_path = conf["paths"]["data"]
    financial_flow_id = generate_financial_flow_id(scenario_id)

    with open(data_path + "scenarios/scenarios.json", "r+") as f:
        scenarios = json.load(f)
        scenarios[str(scenario_id)]["financial_flows"][financial_flow_id] = {
            "id": financial_flow_id,
            "name": name,
            "type": type,
            "subtype": subtype,
            "parameters": parameters,
        }
        f.seek(0)
        json.dump(scenarios, f, indent=4)
        f.truncate()

    df = generate_financial_flow_data(type, subtype, parameters)
    df.to_csv(
        f"{data_path}scenarios/{scenario_id}/{financial_flow_id}.csv",
        index=False,
    )

    build_scenario_data(scenario_id)

    return financial_flow_id


def modify_financial_flow(
    scenario_id: int,
    financial_flow_id: int,
    name: str,
    type: str,
    subtype: str,
    parameters: dict,
):
    data_path = conf["paths"]["data"]

    with open(data_path + "scenarios/scenarios.json", "r+") as f:
        scenarios = json.load(f)

        scenarios[str(scenario_id)]["financial_flows"][
            str(financial_flow_id)
        ] = {
            "id": financial_flow_id,
            "name": name,
            "type": type,
            "subtype": subtype,
            "parameters": parameters,
        }

        f.seek(0)
        json.dump(scenarios, f, indent=4)
        f.truncate()

    df = generate_financial_flow_data(type, subtype, parameters)
    df.to_csv(f"{data_path}scenarios/{scenario_id}/{financial_flow_id}.csv")
    print("########################---", financial_flow_id)
    build_scenario_data(scenario_id)

    return financial_flow_id


def delete_financial_flow(scenario_id: int, financial_flow_id: int):
    data_path = conf["paths"]["data"]
    with open(data_path + "scenarios/scenarios.json", "r+") as f:
        scenarios = json.load(f)
        if str(financial_flow_id) in scenarios[scenario_id]["financial_flows"]:
            del scenarios[scenario_id]["financial_flows"][
                str(financial_flow_id)
            ]
            f.seek(0)
            json.dump(scenarios, f, indent=4)
            f.truncate()

            os.remove(
                f"{data_path}scenarios/{scenario_id}/{financial_flow_id}.csv"
            )

    build_scenario_data(scenario_id)

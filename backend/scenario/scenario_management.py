import json
import os
import shutil

from placement.placement_management import modify_placement
from scenario.scenario_read import load_placement, load_scenarios
from settings import conf


def generate_scenario_id():
    scenarios = load_scenarios()
    if scenarios:
        existing_id = [int(i) for i in scenarios.keys()]
        id_range = range(1, max(existing_id) + 1)
        for i in id_range:
            if int(i) not in existing_id:
                return int(i)
        return max(id_range) + 1
    return 1


def add_scenario(
    name: str,
    initial_deposit: float,
    monthly_deposit: float,
    start_year: int = None,
    start_month: int = None,
    end_year: int = None,
    end_month: int = None,
) -> int:

    data_path = conf["paths"]["data"]
    scenario_id = generate_scenario_id()

    with open(data_path + "scenarios/scenarios.json", "r+") as f:
        scenarios = json.load(f)
        scenarios[scenario_id] = {
            "id": scenario_id,
            "name": name,
            "initial_deposit": initial_deposit,
            "monthly_deposit": monthly_deposit,
            "start_year": start_year,
            "start_month": start_month,
            "end_year": end_year,
            "end_month": end_month,
            "placements": {},
        }
        f.seek(0)
        json.dump(scenarios, f, indent=4)
        f.truncate()

    os.makedirs(f"{data_path}scenarios/{str(scenario_id)}")

    return scenario_id


def modify_scenario(
    scenario_id: int,
    name: str,
    initial_deposit: float,
    monthly_deposit: float,
    end_year: int = None,
    end_month: int = None,
):
    data_path = conf["paths"]["data"]

    with open(data_path + "scenarios/scenarios.json", "r+") as f:
        scenarios = json.load(f)
        scenarios[str(scenario_id)]["name"] = name
        scenarios[str(scenario_id)]["initial_deposit"] = initial_deposit
        scenarios[str(scenario_id)]["monthly_deposit"] = monthly_deposit
        scenarios[str(scenario_id)]["end_year"] = end_year
        scenarios[str(scenario_id)]["end_month"] = end_month

        f.seek(0)
        json.dump(scenarios, f, indent=4)
        f.truncate()

        for placement in scenarios[str(scenario_id)]["placements"].values():
            modify_placement(
                scenario_id,
                placement["id"],
                placement["name"],
                placement["type"],
                placement["parameters"],
            )

    return scenario_id


def get_scenario_data(scenario_id: int) -> dict:
    scenario = load_scenarios().get(str(scenario_id))

    data = {}

    simulation_duration = (
        (scenario["end_year"] - scenario["start_year"]) * 12
        + scenario["end_month"]
        - scenario["start_month"]
    )

    dates = [
        f"{scenario['start_year'] + (month // 12)}-{(month % 12) + 1:02d}"
        for month in range(simulation_duration)
    ]

    data["dates"] = dates

    data["patrimony"] = {}
    data["patrimony"]["cash"] = []
    data["patrimony"]["placements"] = {}

    data["cash_flows"] = {}
    data["cash_flows"]["placements"] = {}
    data["cash_flows"]["situation"] = {
        "initial_deposit": [
            scenario["initial_deposit"] if i == 0 else 0
            for i in range(len(data["dates"]))
        ],
        "monthly_deposit": [
            scenario["monthly_deposit"] for _ in range(len(data["dates"]))
        ],
    }

    for i in range(len(data["dates"])):
        cash_flow = 0
        for placement_id in scenario["placements"].keys():
            placement = load_placement(scenario_id, placement_id)
            cash_flow += placement["cash_flows"][i]

        if i > 0:
            data["patrimony"]["cash"].append(
                +data["patrimony"]["cash"][-1]
                + scenario["monthly_deposit"]
                + cash_flow
            )
        else:
            data["patrimony"]["cash"].append(
                scenario["initial_deposit"] + cash_flow
            )

    for placement_id in scenario["placements"].keys():
        placement = load_placement(scenario_id, placement_id)
        data["patrimony"]["placements"][placement_id] = placement["patrimony"]
        data["cash_flows"]["placements"][placement_id] = placement[
            "cash_flows"
        ]

    return data


def delete_scenario(scenario_id: int):
    data_path = conf["paths"]["data"]
    with open(data_path + "scenarios/scenarios.json", "r+") as f:
        scenarios = json.load(f)
        if str(scenario_id) in scenarios:
            del scenarios[str(scenario_id)]
            f.seek(0)
            json.dump(scenarios, f, indent=4)
            f.truncate()

            shutil.rmtree(f"{data_path}scenarios/{scenario_id}")

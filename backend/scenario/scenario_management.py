import json
import os
import shutil

from charge.charge_management import modify_charge
from investment.investment_management import modify_investment
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


def generate_scenario_id():
    data_path = conf["paths"]["data"]
    with open(data_path + "scenarios/scenarios.json", "r") as f:
        scenarios = json.load(f)
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
            "investments": {},
            "charges": {},
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

        for investment in scenarios[str(scenario_id)]["investments"].values():
            modify_investment(
                scenario_id,
                investment["id"],
                investment["name"],
                investment["type"],
                investment["parameters"],
            )

        for charge in scenarios[str(scenario_id)]["charges"].values():
            modify_charge(
                scenario_id,
                charge["id"],
                charge["name"],
                charge["type"],
                charge["parameters"],
            )

    return scenario_id


def get_scenario_data(scenario_id: int) -> dict:
    data_path = conf["paths"]["data"]

    with open(data_path + "scenarios/scenarios.json", "r") as f:
        scenario = json.load(f)[str(scenario_id)]

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
    data["patrimony"]["investments"] = {}
    data["patrimony"]["charges"] = {}

    data["cash_flows"] = {}
    data["cash_flows"]["investments"] = {}
    data["cash_flows"]["charges"] = {}
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
        for investment_id in scenario["investments"].keys():
            investment = load_investment(scenario_id, investment_id)
            cash_flow += investment["cash_flows"][i]
        for charge_id in scenario["charges"].keys():
            charge = load_charge(scenario_id, charge_id)
            cash_flow += charge["cash_flows"][i]

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

    for investment_id in scenario["investments"].keys():
        investment = load_investment(scenario_id, investment_id)
        data["patrimony"]["investments"][investment_id] = investment[
            "patrimony"
        ]
        data["cash_flows"]["investments"][investment_id] = investment[
            "cash_flows"
        ]

    for charge_id in scenario["charges"].keys():
        charge = load_investment(scenario_id, charge_id)
        data["cash_flows"]["charges"][charge_id] = charge["cash_flows"]

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

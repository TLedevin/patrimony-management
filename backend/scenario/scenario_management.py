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


def add_scenario(name: str, initial_cash: float, monthly_cash: float):
    data_path = conf["paths"]["data"]
    scenario_id = generate_scenario_id()

    simulation_duration = (
        (conf["simulation_end_year"] - conf["simulation_start_year"]) * 12
        + conf["simulation_end_month"]
        - conf["simulation_start_month"]
    )

    cash_baseline = [
        initial_cash + i * monthly_cash for i in range(simulation_duration)
    ]

    dates = [
        f"{conf['simulation_start_year'] + (month // 12)}-{(month % 12) + 1:02d}"
        for month in range(simulation_duration)
    ]

    with open(data_path + "scenarios/scenarios.json", "r+") as f:
        scenarios = json.load(f)
        scenarios[scenario_id] = {
            "id": scenario_id,
            "name": name,
            "dates": dates,
            "cash_baseline": cash_baseline,
            "investments": {},
        }
        f.seek(0)
        json.dump(scenarios, f)
        f.truncate()
    return scenario_id


def get_scenario_data(scenario_id: int) -> dict:
    data_path = conf["paths"]["data"]

    with open(data_path + "scenarios/scenarios.json", "r") as f:
        scenario = json.load(f)[str(scenario_id)]

    data = {}
    data["dates"] = scenario["dates"]

    data["patrimony"] = {}
    data["patrimony"]["cash"] = []

    patrimony_keys = []
    for investment_id in scenario["investments"].keys():
        for key in scenario["investments"][investment_id]["data"]["patrimony"]:
            if key not in patrimony_keys:
                patrimony_keys.append(key)

    for key in patrimony_keys:
        data["patrimony"][key] = []

    for i in range(len(data["dates"])):
        cash_flow = 0
        for investment_id in scenario["investments"].keys():
            cash_flow += scenario["investments"][investment_id]["data"][
                "cash_flows"
            ][i]

        if i > 0:
            data["patrimony"]["cash"].append(
                scenario["cash_baseline"][i]
                + data["patrimony"]["cash"][-1]
                - scenario["cash_baseline"][i - 1]
                + cash_flow
            )
        else:
            data["patrimony"]["cash"].append(
                scenario["cash_baseline"][0] + cash_flow
            )

        for key in patrimony_keys:
            patrimony = 0
            for investment_id in scenario["investments"].keys():
                if key in data["patrimony"]:
                    patrimony += scenario["investments"][investment_id][
                        "data"
                    ]["patrimony"][key][i]
            data["patrimony"][key].append(patrimony)

    return data


def delete_scenario(scenario_id: int):
    data_path = conf["paths"]["data"]
    with open(data_path + "scenarios/scenarios.json", "r+") as f:
        scenarios = json.load(f)
        if str(scenario_id) in scenarios:
            del scenarios[str(scenario_id)]
            f.seek(0)
            json.dump(scenarios, f)
            f.truncate()

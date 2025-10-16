import json

from settings import conf


def generate_investment_id(scenario_id: int):
    data_path = conf["paths"]["data"]
    with open(data_path + "scenarios/scenarios.json", "r") as f:
        scenarios = json.load(f)
    if scenarios:
        existing_id = [
            int(i) for i in scenarios[scenario_id]["investments"].keys()
        ]
        if len(existing_id) > 0:

            id_range = range(1, max(existing_id) + 1)
            for i in id_range:
                if int(i) not in existing_id:
                    return int(i)
            return max(id_range) + 1
    return 1


def add_investment(scenario_id: int, name: str):
    data_path = conf["paths"]["data"]
    investment_id = generate_investment_id(scenario_id)

    with open(data_path + "scenarios/scenarios.json", "r+") as f:
        scenarios = json.load(f)
        scenarios[scenario_id]["investments"][investment_id] = {
            "id": investment_id,
            "name": name,
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

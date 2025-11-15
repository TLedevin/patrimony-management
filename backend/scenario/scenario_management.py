import json
import os
import shutil

import pandas as pd
from placement.placement_read import load_placement_data
from scenario.scenario_read import load_scenarios
from settings import conf
from utils.main import clean_params, get_dates_from_parameters


def build_scenario_data(scenario_id: int) -> None:
    scenario = load_scenarios().get(str(scenario_id))
    df = get_dates_from_parameters(scenario)[["date"]].copy()
    params = clean_params(scenario)

    # Process placements if available
    if scenario.get("placements"):
        placement_dfs = []
        for placement_id in scenario["placements"]:
            placement = load_placement_data(scenario_id, placement_id).drop(
                columns=["year", "month"]
            )
            placement_melted = placement.melt(
                id_vars=["date"],
                var_name="type",
                value_name="value",
            )
            placement_dfs.append(placement_melted)

        # Combine all placements efficiently
        placements = pd.concat(placement_dfs, ignore_index=True)
        placements = (
            placements.groupby(["date", "type"], as_index=False)
            .agg({"value": "sum"})
            .pivot(index="date", columns="type", values="value")
            .reset_index()
        )

        df = df.merge(placements, on="date", how="left").fillna(0)

    # Ensure 'cash_flow' column exists for calculation
    if "cash_flow" not in df.columns:
        df["cash_flow"] = 0.0

    # Vectorized cash calculation
    cash = [params["initial_deposit"] + df.loc[0, "cash_flow"]]
    for i in range(1, len(df)):
        cash.append(
            cash[-1] + df.loc[i, "cash_flow"] + params["monthly_deposit"]
        )
    df["cash"] = cash

    # Prepare final DataFrame for output
    df = df.drop(columns=["cash_flow"]).melt(
        id_vars=["date"],
        var_name="type",
    )

    # Save to CSV
    data_path = conf["paths"]["data"]
    save_path = f"{data_path}scenarios/{scenario_id}/scenario_data.csv"

    if os.path.exists(save_path):
        os.remove(save_path)

    df.to_csv(save_path, index=False)


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

    build_scenario_data(scenario_id)

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

    build_scenario_data(scenario_id)

    return scenario_id


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

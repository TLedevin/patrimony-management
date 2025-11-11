import numpy as np
from placement.placement_read import load_scenario_dates


def generate_saving_account_data(scenario_id: int, parameters: dict) -> dict:
    end_year, start_year, end_month, start_month = load_scenario_dates(
        scenario_id
    )

    simulation_duration = (
        (end_year - start_year) * 12 + end_month - start_month
    )

    placement_duration = (
        (int(parameters["end_year"]) - int(parameters["start_year"])) * 12
        + int(parameters["end_month"])
        - int(parameters["start_month"])
    )

    placement_start_month = (
        (int(parameters["start_year"]) - start_year) * 12
        + int(parameters["start_month"])
        - start_month
    )

    cash_flows = []
    patrimony = {}
    patrimony["savings"] = []

    for month in range(simulation_duration):
        if month < placement_start_month:
            cash_flows.append(0)
            patrimony["savings"].append(0)

        elif month == placement_start_month:
            cash_flows.append(-float(parameters["initial_investment"]))
            patrimony["savings"].append(
                float(parameters["initial_investment"])
            )

        elif month < placement_start_month + placement_duration:
            if patrimony["savings"][-1] < 22950 - float(
                float(parameters["monthly_investment"])
            ):
                cash_flows.append(-float(parameters["monthly_investment"]))
                if month % 12 == 1:
                    patrimony["savings"].append(
                        patrimony["savings"][-1]
                        * (1 + float(parameters["yearly_interest_rate"]) / 100)
                        + float(parameters["monthly_investment"])
                    )
                else:
                    patrimony["savings"].append(
                        patrimony["savings"][-1]
                        + float(parameters["monthly_investment"])
                    )
            elif patrimony["savings"][-1] < 22950:
                cash_flows.append(22950 - patrimony["savings"][-1])
                if month % 12 == 1:
                    patrimony["savings"].append(
                        22950
                        * (1 + float(parameters["yearly_interest_rate"]) / 100)
                    )
                else:
                    patrimony["savings"].append(22950)
            else:
                cash_flows.append(0)
                if month % 12 == 1:
                    patrimony["savings"].append(
                        patrimony["savings"][-1]
                        * (1 + float(parameters["yearly_interest_rate"]) / 100)
                    )
                else:
                    patrimony["savings"].append(patrimony["savings"][-1])

        elif month == placement_start_month + placement_duration:
            cash_flows.append(patrimony["savings"][-1])
            patrimony["savings"].append(0)

        else:
            patrimony["savings"].append(0)
            cash_flows.append(0)

    return {"cash_flows": cash_flows, "patrimony": patrimony}


def generate_stock_exchange_data(scenario_id: int, parameters: dict) -> dict:
    end_year, start_year, end_month, start_month = load_scenario_dates(
        scenario_id
    )

    monthly_rate = (
        np.exp(
            1
            / 12
            * np.log(1 + float(parameters["yearly_interest_rate"]) / 100)
        )
        - 1
    )

    simulation_duration = (
        (end_year - start_year) * 12 + end_month - start_month
    )

    placement_duration = (
        (int(parameters["end_year"]) - int(parameters["start_year"])) * 12
        + int(parameters["end_month"])
        - int(parameters["start_month"])
    )

    start_month = (
        (int(parameters["start_year"]) - start_year) * 12
        + int(parameters["start_month"])
        - start_month
    )

    cash_flows = []
    patrimony = {}
    patrimony["stock_exchange"] = []

    for month in range(simulation_duration):
        if month < start_month:
            cash_flows.append(0)
            patrimony["stock_exchange"].append(0)

        elif month == start_month:
            cash_flows.append(-float(parameters["initial_investment"]))
            patrimony["stock_exchange"].append(
                float(parameters["initial_investment"])
            )

        elif month < start_month + placement_duration:
            cash_flows.append(-float(parameters["monthly_investment"]))
            patrimony["stock_exchange"].append(
                patrimony["stock_exchange"][-1] * (1 + monthly_rate)
                + float(parameters["monthly_investment"])
            )

        elif month == start_month + placement_duration:
            cash_flows.append(patrimony["stock_exchange"][-1])
            patrimony["stock_exchange"].append(0)

        else:
            patrimony["stock_exchange"].append(0)
            cash_flows.append(0)

    return {"cash_flows": cash_flows, "patrimony": patrimony}


def generate_real_estate_data(scenario_id: int, parameters: dict) -> dict:
    for key in parameters.keys():
        try:
            parameters[key] = float(parameters[key])
        except (ValueError, TypeError):
            pass
    end_year, start_year, end_month, start_month = load_scenario_dates(
        scenario_id
    )

    simulation_duration = (
        (end_year - start_year) * 12 + end_month - start_month
    )

    placement_duration = (
        (parameters["end_year"] - parameters["start_year"]) * 12
        + parameters["end_month"]
        - parameters["start_month"]
    )

    start_month = (
        (parameters["start_year"] - start_year) * 12
        + parameters["start_month"]
        - start_month
    )

    cash_flows = []
    patrimony = {}
    patrimony["real_estate"] = []
    patrimony["debt"] = []

    total_rate = (parameters["loan_rate"] + parameters["insurance_rate"]) / 100

    mensuality = (
        total_rate
        * parameters["loan_amount"]
        / 12
        / (1 - (1 + total_rate / 12) ** (-12 * parameters["loan_duration"]))
    )

    monthly_index = (
        np.exp(1 / 12 * np.log(1 + parameters["yearly_index"] / 100)) - 1
    )

    for month in range(simulation_duration):
        if month < start_month:
            cash_flows.append(0)
            patrimony["real_estate"].append(0)
            patrimony["debt"].append(0)

        elif month == start_month:
            cash_flows.append(
                -parameters["personal_contribution"]
                - mensuality
                - parameters["monthly_charges"]
            )
            patrimony["real_estate"].append(
                parameters["property_value"] + parameters["work_renovation"]
            )
            patrimony["debt"].append(-parameters["loan_amount"])

        elif month < start_month + placement_duration:
            patrimony["real_estate"].append(
                patrimony["real_estate"][-1] * (1 + monthly_index)
            )

            patrimony["debt"].append(
                min(
                    -parameters["loan_amount"]
                    * (
                        (1 + total_rate / 12) ** (month - start_month)
                        - (1 + total_rate / 12)
                        ** (12 * parameters["loan_duration"])
                    )
                    / (
                        1
                        - (1 + total_rate / 12)
                        ** (12 * parameters["loan_duration"])
                    ),
                    0,
                )
            )

            cash_flows.append(
                -parameters["monthly_charges"]
                - (parameters["property_tax"] if month % 12 == 10 else 0)
                - (
                    mensuality
                    if month <= start_month + 12 * parameters["loan_duration"]
                    else 0
                )
            )

        elif month == start_month + placement_duration:
            patrimony["real_estate"].append(0)
            patrimony["debt"].append(0)
            cash_flows.append(
                patrimony["debt"][-2]
                * (1 + parameters["early_repayment_fees"] / 100)
                + patrimony["real_estate"][-2] * (1 + monthly_index)
            )

        else:
            patrimony["real_estate"].append(0)
            patrimony["debt"].append(0)
            cash_flows.append(0)

    patrimony["net_real_estate"] = [
        patrimony["real_estate"][i] + patrimony["debt"][i]
        for i in range(len(patrimony["real_estate"]))
    ]
    return {"cash_flows": cash_flows, "patrimony": patrimony}


def generate_rental_placement_data(scenario_id: int, parameters: dict) -> dict:
    for key in parameters.keys():
        try:
            parameters[key] = float(parameters[key])
        except (ValueError, TypeError):
            pass
    end_year, start_year, end_month, start_month = load_scenario_dates(
        scenario_id
    )

    simulation_duration = (
        (end_year - start_year) * 12 + end_month - start_month
    )

    placement_duration = (
        (parameters["end_year"] - parameters["start_year"]) * 12
        + parameters["end_month"]
        - parameters["start_month"]
    )

    start_month = (
        (parameters["start_year"] - start_year) * 12
        + parameters["start_month"]
        - start_month
    )

    cash_flows = []
    patrimony = {}
    patrimony["real_estate"] = []
    patrimony["debt"] = []

    total_rate = (parameters["loan_rate"] + parameters["insurance_rate"]) / 100

    mensuality = (
        total_rate
        * parameters["loan_amount"]
        / 12
        / (1 - (1 + total_rate / 12) ** (-12 * parameters["loan_duration"]))
    )

    monthly_index = (
        np.exp(1 / 12 * np.log(1 + parameters["yearly_index"] / 100)) - 1
    )

    for month in range(simulation_duration):
        if month < start_month:
            cash_flows.append(0)
            patrimony["real_estate"].append(0)
            patrimony["debt"].append(0)

        elif month == start_month:
            cash_flows.append(
                parameters["occupancy_rate"]
                / 100
                * parameters["rental_including_charges"]
                - parameters["personal_contribution"]
                - mensuality
                - parameters["monthly_charges"]
            )
            patrimony["real_estate"].append(
                parameters["property_value"] + parameters["work_renovation"]
            )
            patrimony["debt"].append(-parameters["loan_amount"])

        elif month < start_month + placement_duration:
            patrimony["real_estate"].append(
                patrimony["real_estate"][-1] * (1 + monthly_index)
            )

            patrimony["debt"].append(
                min(
                    -parameters["loan_amount"]
                    * (
                        (1 + total_rate / 12) ** (month - start_month)
                        - (1 + total_rate / 12)
                        ** (12 * parameters["loan_duration"])
                    )
                    / (
                        1
                        - (1 + total_rate / 12)
                        ** (12 * parameters["loan_duration"])
                    ),
                    0,
                )
            )

            cash_flows.append(
                parameters["occupancy_rate"]
                / 100
                * parameters["rental_including_charges"]
                - parameters["monthly_charges"]
                - (parameters["property_tax"] if month % 12 == 10 else 0)
                - (
                    mensuality
                    if month <= start_month + 12 * parameters["loan_duration"]
                    else 0
                )
            )

        elif month == start_month + placement_duration:
            patrimony["real_estate"].append(0)
            patrimony["debt"].append(0)
            cash_flows.append(
                patrimony["debt"][-2]
                * (1 + parameters["early_repayment_fees"] / 100)
                + patrimony["real_estate"][-2] * (1 + monthly_index)
            )

        else:
            patrimony["real_estate"].append(0)
            patrimony["debt"].append(0)
            cash_flows.append(0)

    patrimony["net_real_estate"] = [
        patrimony["real_estate"][i] + patrimony["debt"][i]
        for i in range(len(patrimony["real_estate"]))
    ]
    return {"cash_flows": cash_flows, "patrimony": patrimony}

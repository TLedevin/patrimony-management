import numpy as np
from utils.main import clean_params, get_dates_from_parameters


def generate_placement_data(type: str, subtype: str, params: dict) -> dict:
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

    return mapping_placement_types[type][subtype](params)


# Charges
def generate_personal_use_rental_data(params: dict):
    df = get_dates_from_parameters(params)
    df["cash_flow"] = -float(params["rent_including_charges"])

    return df


# Investments
def generate_saving_account_data(params: dict) -> dict:
    df = get_dates_from_parameters(params)
    params = clean_params(params)

    yearly_interest_rate = 1 + params["yearly_interest_rate"] / 100

    cash_flow = []
    savings = []

    for i, row in df.iterrows():
        if i == 0:
            cash_flow.append(-params["initial_investment"])
            savings.append(params["initial_investment"])
        elif i < len(df) - 1:
            if savings[-1] < 22950 - params["monthly_investment"]:
                cash_flow.append(-params["monthly_investment"])
                if row["month"] % 12 == 1:
                    savings.append(
                        savings[-1] * (1 + yearly_interest_rate)
                        + params["monthly_investment"]
                    )
                else:
                    savings.append(savings[-1] + params["monthly_investment"])

            elif savings[-1] < 22950:
                cash_flow.append(22950 - savings[-1])
                if row["month"] % 12 == 1:
                    savings.append(22950 * (1 + yearly_interest_rate))
                else:
                    savings.append(22950)
            else:
                cash_flow.append(0)
                if row["month"] % 12 == 1:
                    savings.append(savings[-1] * (1 + yearly_interest_rate))

                else:
                    savings.append(savings[-1])
        else:
            cash_flow.append(savings[-1])
            savings.append(0)

    df["cash_flow"] = cash_flow
    df["savings"] = savings

    return df


def generate_stock_exchange_data(params: dict) -> dict:
    df = get_dates_from_parameters(params)
    params = clean_params(params)

    monthly_rate = (
        np.exp(1 / 12 * np.log(1 + params["yearly_interest_rate"] / 100)) - 1
    )

    cash_flow = []
    stock_exchange = []

    for i, row in df.iterrows():
        if i == 0:
            cash_flow.append(-params["initial_investment"])
            stock_exchange.append(params["initial_investment"])
        elif i < len(df) - 1:
            cash_flow.append(-params["monthly_investment"])
            stock_exchange.append(
                stock_exchange[-1] * (1 + monthly_rate)
                + params["monthly_investment"]
            )
        else:
            cash_flow.append(stock_exchange[-1])
            stock_exchange.append(0)

    df["cash_flow"] = cash_flow
    df["stock_exchange"] = stock_exchange

    return df


def generate_real_estate_data(params: dict) -> dict:
    df = get_dates_from_parameters(params)
    params = clean_params(params)

    total_rate = (params["loan_rate"] + params["insurance_rate"]) / 100

    mensuality = (
        total_rate
        * params["loan_amount"]
        / 12
        / (1 - (1 + total_rate / 12) ** (-12 * params["loan_duration"]))
    )

    monthly_index = (
        np.exp(1 / 12 * np.log(1 + params["yearly_index"] / 100)) - 1
    )

    monthly_rate = total_rate / 12

    cash_flow = []
    real_estate = []
    debt = []

    for i, row in df.iterrows():

        if i == 0:
            cash_flow.append(
                -params["personal_contribution"]
                - mensuality
                - params["monthly_charges"]
            )
            real_estate.append(
                params["property_value"] + params["work_renovation"]
            )
            debt.append(-params["loan_amount"])

        elif i < len(df) - 1:
            real_estate.append(real_estate[-1] * (1 + monthly_index))

            debt.append(
                min(
                    -params["loan_amount"]
                    * (
                        (1 + monthly_rate) ** i
                        - (1 + monthly_rate) ** (12 * params["loan_duration"])
                    )
                    / (
                        1
                        - (1 + monthly_rate) ** (12 * params["loan_duration"])
                    ),
                    0,
                )
            )

            cash_flow.append(
                -params["monthly_charges"]
                - (params["property_tax"] if row["month"] % 12 == 10 else 0)
                - (
                    mensuality
                    if row["month"] <= 12 * params["loan_duration"]
                    else 0
                )
            )

        else:
            real_estate.append(0)
            debt.append(0)
            cash_flow.append(
                debt[-2] * (1 + params["early_repayment_fees"] / 100)
                + real_estate[-2] * (1 + monthly_index)
            )
    df["real_estate"] = real_estate
    df["debt"] = debt
    df["cash_flow"] = cash_flow
    df["net_real_estate"] = df["real_estate"] + df["debt"]

    return df


def generate_rental_placement_data(params: dict) -> dict:
    df = get_dates_from_parameters(params)
    params = clean_params(params)

    total_rate = (params["loan_rate"] + params["insurance_rate"]) / 100

    mensuality = (
        total_rate
        * params["loan_amount"]
        / 12
        / (1 - (1 + total_rate / 12) ** (-12 * params["loan_duration"]))
    )

    monthly_index = (
        np.exp(1 / 12 * np.log(1 + params["yearly_index"] / 100)) - 1
    )

    monthly_rate = total_rate / 12

    cash_flow = []
    real_estate = []
    debt = []

    for i, row in df.iterrows():
        if i == 0:
            cash_flow.append(
                params["occupancy_rate"]
                / 100
                * params["rental_including_charges"]
                - params["personal_contribution"]
                - mensuality
                - params["monthly_charges"]
            )
            real_estate.append(
                params["property_value"] + params["work_renovation"]
            )
            debt.append(-params["loan_amount"])

        elif i < len(df) - 1:
            real_estate.append(real_estate[-1] * (1 + monthly_index))

            debt.append(
                min(
                    -params["loan_amount"]
                    * (
                        (1 + monthly_rate) ** i
                        - (1 + monthly_rate) ** (12 * params["loan_duration"])
                    )
                    / (
                        1
                        - (1 + monthly_rate) ** (12 * params["loan_duration"])
                    ),
                    0,
                )
            )

            cash_flow.append(
                params["occupancy_rate"]
                / 100
                * params["rental_including_charges"]
                - params["monthly_charges"]
                - (params["property_tax"] if row["month"] % 12 == 10 else 0)
                - (
                    mensuality
                    if row["month"] <= 12 * params["loan_duration"]
                    else 0
                )
            )

        else:
            real_estate.append(0)
            debt.append(0)
            cash_flow.append(
                debt[-2] * (1 + params["early_repayment_fees"] / 100)
                + real_estate[-2] * (1 + monthly_index)
            )

    df["net_real_estate"] = df["real_estate"] + df["debt"]

    return df

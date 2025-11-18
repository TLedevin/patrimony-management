import pandas as pd
from utils.main import get_dates_from_parameters


def generate_income_data(params: dict):
    df = get_dates_from_parameters(params)
    df["cash_flow"] = float(params["income"])

    return df


def generate_one_off_income(params: dict):
    dates = [f"{int(params['year'])}-{int(params['month']):02d}"]
    df = pd.DataFrame(
        {"date": dates, "year": [params["year"]], "month": [params["month"]]}
    )

    df["cash_flow"] = float(params["value"])

    return df

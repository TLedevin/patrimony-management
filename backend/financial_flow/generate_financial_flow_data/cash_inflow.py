from utils.main import get_dates_from_parameters


def generate_income_data(params: dict):
    df = get_dates_from_parameters(params)
    df["cash_flow"] = float(params["income"])

    return df

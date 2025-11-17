from utils.main import get_dates_from_parameters


def generate_personal_use_rental_data(params: dict):
    df = get_dates_from_parameters(params)
    df["cash_flow"] = -float(params["rent_including_charges"])

    return df

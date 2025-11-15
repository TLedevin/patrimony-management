import pandas as pd


def get_dates_from_parameters(params: dict) -> pd.DataFrame:
    start_y = int(params["start_year"])
    start_m = int(params["start_month"])
    end_y = int(params["end_year"])
    end_m = int(params["end_month"])

    duration = (end_y - start_y) * 12 + end_m - start_m
    dates = [
        f"{start_y + (start_m + m) // 12}-{((start_m + m) % 12) + 1:02d}"
        for m in range(duration)
    ]
    years = [start_y + (start_m + m) // 12 for m in range(duration)]
    months = [((start_m + m) % 12) + 1 for m in range(duration)]

    return pd.DataFrame({"date": dates, "year": years, "month": months})


def clean_params(params: dict) -> dict:
    for key in params.keys():
        try:
            params[key] = float(params[key])
        except (ValueError, TypeError):
            pass
    return params

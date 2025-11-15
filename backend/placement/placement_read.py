import pandas as pd
from settings import conf


def load_placement_data(scenario_id: int, placement_id: int) -> pd.DataFrame:
    data_path = conf["paths"]["data"]

    return pd.read_csv(
        f"{data_path}scenarios/{scenario_id}/{placement_id}.csv",
    )

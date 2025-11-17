import pandas as pd
from settings import conf


def load_financial_flow_data(
    scenario_id: int, financial_flow_id: int
) -> pd.DataFrame:
    data_path = conf["paths"]["data"]
    data = pd.read_csv(
        f"{data_path}scenarios/{scenario_id}/{financial_flow_id}.csv"
    )
    print(data)
    return data

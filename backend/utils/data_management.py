import pandas as pd
from settings import conf


def load_patrimony_history():
    data = pd.read_excel(conf["paths"]["data"] + "patrimony_history.xlsx")
    return data

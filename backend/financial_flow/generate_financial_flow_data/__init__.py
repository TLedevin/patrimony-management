from .cash_inflow import generate_income_data
from .charges import generate_personal_use_rental_data
from .investments import (
    generate_real_estate_data,
    generate_rental_financial_flow_data,
    generate_saving_account_data,
    generate_stock_exchange_data,
)


def generate_financial_flow_data(
    type: str, subtype: str, params: dict
) -> dict:
    mapping_financial_flow_types = {
        "investment": {
            "saving_account": generate_saving_account_data,
            "stock_exchange": generate_stock_exchange_data,
            "real_estate": generate_real_estate_data,
            "rental_investment": generate_rental_financial_flow_data,
        },
        "charges": {
            "rental_personal_use": generate_personal_use_rental_data,
        },
        "cash_inflow": {
            "income": generate_income_data,
        },
    }
    print(type, subtype, params)
    return mapping_financial_flow_types[type][subtype](params)

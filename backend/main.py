from flask import f

from backend.investment.investment_management import (
    add_investment,
    delete_investment,
)
from backend.scenario.scenario_management import (
    add_scenario,
    delete_scenario,
    load_scenarios,
)

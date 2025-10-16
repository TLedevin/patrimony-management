import logging

from flask import Flask, jsonify
from flask_cors import CORS
from investment.investment_management import add_investment, delete_investment
from scenario.scenario_management import (
    add_scenario,
    delete_scenario,
    load_scenarios,
)

# Create Flask app
app = Flask(__name__)

# Enable CORS for all routes (important for React frontend)
CORS(app)

# Configuration
app.config["DEBUG"] = True
app.config["JSON_SORT_KEYS"] = False  # Preserve JSON key order

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.route("/api/add_scenario/<string:name>", methods=["GET", "POST"])
def api_add_scenario(name):
    result = add_scenario(name)
    logger.info(f"Added scenario: {name}")
    return jsonify(result)


@app.route("/api/load_scenarios/", methods=["GET"])
def api_load_scenarios():
    scenarios = load_scenarios()
    logger.info("Loaded scenarios successfully")
    return jsonify(scenarios)


@app.route("/api/delete_scenario/<string:id>", methods=["GET"])
def api_delete_scenarios(id):
    delete_scenario(int(id))
    scenarios = load_scenarios()
    logger.info("Deleted scenarios successfully")
    return jsonify(scenarios)


@app.route(
    "/api/add_investment/<string:scenario_id>/<string:name>",
    methods=["GET", "POST"],
)
def api_add_investment(scenario_id, name):
    result = add_investment(scenario_id, name)
    logger.info(f"Added investment: {name} to scenario {scenario_id}")
    return jsonify(result)


@app.route(
    "/api/delete_investment/<string:scenario_id>/<string:investment_id>",
    methods=["GET"],
)
def api_delete_investment(scenario_id, investment_id):
    delete_investment(scenario_id, investment_id)
    logger.info(
        f"Deleted investment: {investment_id} from scenario {scenario_id}"
    )
    return jsonify({"status": "success"})


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True,
        threaded=True,
    )

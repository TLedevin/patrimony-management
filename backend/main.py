import logging

from flask import Flask, jsonify, request
from flask_cors import CORS
from investment.investment_management import (
    add_investment,
    delete_investment,
    generate_investment_data,
)
from scenario.scenario_management import (
    add_scenario,
    delete_scenario,
    get_scenario_data,
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


@app.route("/api/add_scenario/", methods=["GET"])
def api_add_scenario():
    name = request.args.get("name")
    initial_deposit = request.args.get("initial_deposit")
    monthly_deposit = request.args.get("monthly_deposit")
    start_year = request.args.get("start_year")
    start_month = request.args.get("start_month")
    end_year = request.args.get("end_year")
    end_month = request.args.get("end_month")
    result = add_scenario(
        name,
        float(initial_deposit),
        float(monthly_deposit),
        int(start_year),
        int(start_month),
        int(end_year),
        int(end_month),
    )
    logger.info(f"Added scenario: {name}")
    return jsonify(result)


@app.route("/api/load_scenarios/", methods=["GET"])
def api_load_scenarios():
    scenarios = load_scenarios()
    logger.info("Loaded scenarios successfully")
    return jsonify(scenarios)


@app.route("/api/get_scenario_data/", methods=["GET"])
def api_get_scenario_data():
    scenario_id = request.args.get("scenario_id")
    data = get_scenario_data(scenario_id)
    logger.info(f"Retrieved data for scenario: {scenario_id}")
    return jsonify(data)


@app.route("/api/delete_scenario/", methods=["GET"])
def api_delete_scenarios():
    id = request.args.get("id")
    delete_scenario(int(id))
    scenarios = load_scenarios()
    logger.info("Deleted scenarios successfully")
    return jsonify(scenarios)


@app.route("/api/add_investment/", methods=["GET"])
def api_add_investment():
    params = request.args.to_dict()
    # Extract required parameters
    scenario_id = params.pop("scenario_id", None)
    name = params.pop("name", None)
    investment_type = params.pop("investment_type", None)
    # All remaining parameters are investment parameters
    result = add_investment(scenario_id, name, investment_type, params)
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


@app.route(
    "/api/generate_investment_data/<string:scenario_id>",
    methods=["POST"],
)
def api_generate_investment_data(scenario_id):
    parameters = request.json
    result = generate_investment_data(scenario_id, parameters)
    logger.info(
        f"Generated investment data: {parameters} for scenario {scenario_id}"
    )
    return jsonify(result)


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True,
        threaded=True,
    )

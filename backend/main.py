import logging

from financial_flow.financial_flow_management import (
    add_financial_flow,
    delete_financial_flow,
    modify_financial_flow,
)
from flask import Flask, jsonify, request
from flask_cors import CORS
from scenario.scenario_management import (
    add_scenario,
    delete_scenario,
    load_scenarios,
    modify_scenario,
)
from scenario.scenario_read import load_scenario_data

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


@app.route("/api/modify_scenario/", methods=["GET"])
def api_modify_scenario():
    scenario_id = request.args.get("scenario_id")
    name = request.args.get("name")
    initial_deposit = request.args.get("initial_deposit")
    monthly_deposit = request.args.get("monthly_deposit")
    end_year = request.args.get("end_year")
    end_month = request.args.get("end_month")
    result = modify_scenario(
        int(scenario_id),
        name,
        float(initial_deposit),
        float(monthly_deposit),
        int(end_year),
        int(end_month),
    )
    logger.info(f"Modified scenario: {scenario_id}")
    return jsonify(result)


@app.route("/api/load_scenarios/", methods=["GET"])
def api_load_scenarios():
    scenarios = load_scenarios()
    logger.info("Loaded scenarios successfully")
    return jsonify(scenarios)


@app.route("/api/get_scenario_data/", methods=["GET"])
def api_get_scenario_data():
    scenario_id = request.args.get("scenario_id")
    data = load_scenario_data(scenario_id).to_dict(orient="records")

    logger.info(f"Retrieved data for scenario: {scenario_id}")
    return jsonify(data)


@app.route("/api/delete_scenario/", methods=["GET"])
def api_delete_scenarios():
    id = request.args.get("id")
    delete_scenario(int(id))
    scenarios = load_scenarios()
    logger.info("Deleted scenarios successfully")
    return jsonify(scenarios)


@app.route("/api/add_financial_flow/", methods=["GET"])
def api_add_financial_flow():
    params = request.args.to_dict()
    # Extract required parameters
    scenario_id = params.pop("scenario_id", None)
    name = params.pop("name", None)
    financial_flow_type = params.pop("financial_flow_type", None)
    financial_flow_subtype = params.pop("financial_flow_subtype", None)
    # All remaining parameters are financial_flow parameters
    result = add_financial_flow(
        scenario_id, name, financial_flow_type, financial_flow_subtype, params
    )
    logger.info(f"Added financial_flow: {name} to scenario {scenario_id}")
    return jsonify(result)


@app.route("/api/modify_financial_flow/", methods=["GET"])
def api_modify_financial_flow():
    params = request.args.to_dict()
    # Extract required parameters
    scenario_id = params.pop("scenario_id", None)
    financial_flow_id = params.pop("financial_flow_id", None)
    name = params.pop("name", None)
    financial_flow_type = params.pop("financial_flow_type", None)
    financial_flow_subtype = params.pop("financial_flow_subtype", None)
    print("########################", financial_flow_id)
    # All remaining parameters are financial_flow parameters
    result = modify_financial_flow(
        scenario_id,
        financial_flow_id,
        name,
        financial_flow_type,
        financial_flow_subtype,
        params,
    )
    logger.info(
        f"Modified financial_flow: {financial_flow_id} in scenario {scenario_id}"
    )
    return jsonify(result)


@app.route(
    "/api/delete_financial_flow/<string:scenario_id>/<string:financial_flow_id>",
    methods=["GET"],
)
def api_delete_financial_flow(scenario_id, financial_flow_id):
    delete_financial_flow(scenario_id, financial_flow_id)
    logger.info(
        f"Deleted financial_flow: {financial_flow_id} from scenario {scenario_id}"
    )
    return jsonify({"status": "success"})


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True,
        threaded=True,
    )

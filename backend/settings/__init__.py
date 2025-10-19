import os
from datetime import datetime

from pyhocon import ConfigFactory

dir_path = os.path.dirname(os.path.realpath(__file__))
conf = ConfigFactory.parse_file(os.path.join(dir_path, "config.conf"))
conf["simulation_end_year"] = datetime.now().year + conf["simulation_horizon"]
conf["simulation_end_month"] = 1
conf["simulation_start_year"] = datetime.now().year
conf["simulation_start_month"] = 1

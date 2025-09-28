import os
from pathlib import Path
from pyhocon import ConfigFactory
import toml

dir_path = os.path.dirname(os.path.realpath(__file__))
conf = ConfigFactory.parse_file(os.path.join(dir_path, "config.conf"))

theme_file = Path(dir_path).parent / ".streamlit" / "config.toml"
conf["theme"] = toml.load(str(theme_file))["theme"]

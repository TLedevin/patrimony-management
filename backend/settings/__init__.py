import os

from pyhocon import ConfigFactory

dir_path = os.path.dirname(os.path.realpath(__file__))
conf = ConfigFactory.parse_file(os.path.join(dir_path, "config.conf"))

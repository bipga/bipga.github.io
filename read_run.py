"""Read one existing attempt without running an alignment method."""
import argparse
import json

import bpupga as bp

parser = argparse.ArgumentParser()
parser.add_argument("attempt_dir")
args = parser.parse_args()
run = bp.RunLog.open(args.attempt_dir)
print(json.dumps(run.summary(), indent=2))

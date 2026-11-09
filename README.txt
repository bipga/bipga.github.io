BPUPGA local Python API

From the repository root:
export PYTHONPATH="$PWD/baseline_exdit_261029/api${PYTHONPATH:+:$PYTHONPATH}"

Or, using the existing project environment:
python -m pip install --no-deps --no-build-isolation -e baseline_exdit_261029/api

The facade requires the complete research checkout and existing method dependencies. It is not published on PyPI.

Current API files: api/bpupga (Python), api/site (docs). Methods are grouped under baseline/, including baseline/opgm_unsupervised/.

See installation.html and quickstart.html for complete guidance.

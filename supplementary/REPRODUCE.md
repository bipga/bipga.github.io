# Reproduction guide

The workflow is: supplied graph inputs → recorded configurations → graph-only model fitting → evaluation → seed aggregation → figures and tables. All commands below run from the extracted `bipga/` directory.

## Inputs and evaluation

`datasets/index.csv` identifies the 323 experiment graph pairs. Each pair includes edge lists, explicit node lists and reference correspondences. Node lists preserve isolated vertices. The supplied graph instances are the exact experiment inputs; the six source pairs are also included under `datasets/*/base/`. `construction/` contains the bilateral partial-graph constructor.

`experiments/runs.csv` lists 3,908 configurations. Each row joins a graph ID to a method, seed, parameter record and execution configuration. `experiments/parameters.json` contains the parameters. The per-run CSVs under `data/` select the configurations used by each paper figure and table.

`run.py` passes only the graph topology, parameters, random seed and device configuration to the inference process. Reference correspondences remain in the parent process and are used after fitting to evaluate native pair F1, node F1 and bidirectional ranking metrics. The native pair output is evaluated as returned by the method. GRAMPA uses the supplied soft-score ranking routine.

## Recompute the supplied results

This path uses the supplied observations and runs on a CPU. It does not train models or run CUDA assignment.

```bash
python -m pip install -r requirements-analysis.txt
python scripts/reproduce_results.py --output reproduced
```

The command writes `reproduced/data/figure_05/` through `figure_09/` and `reproduced/data/table_ii/`, `table_iv/`, `table_v/`, `table_vi/`. Each directory contains the numerical summary as `values.csv`; repeated observations also have `values_by_run.csv`. The command checks that every recomputed summary agrees with the supplied results and stops on a mismatch.

Figures 5–8 and Table IV are aggregated from individual recorded observations. Figure 9 and Tables V/VI are recomputed from query-level predictions, rankings, assignments and exact orbit records. Table II is recomputed directly from the six source graph pairs.

## Render the figures

```bash
python scripts/plot_results.py --figure 5 --data-root reproduced/data --output reproduced/figure05.pdf
python scripts/plot_results.py --figure 6 --data-root reproduced/data --output reproduced/figure06.pdf
python scripts/plot_results.py --figure 7 --data-root reproduced/data --output reproduced/figure07.pdf
python scripts/plot_results.py --figure 8 --data-root reproduced/data --output reproduced/figure08.pdf
python scripts/plot_figure09.py --data-root reproduced/data --no-tex --output-dir reproduced/figure09
```

Figures 5–8 use a compact rendering of the same numerical series. Figure 9 uses the nine-panel layout. The supplied `figures/` PDFs and `tables/` LaTeX fragments are the paper artifacts; numerical table results are in the corresponding `data/` directories.

## Fit the models from the graph inputs

Model fitting requires Linux, Python 3.10, an NVIDIA GPU and the CUDA compiler. The paper hardware was two Intel Xeon Platinum 8457C CPUs and eight RTX 5090 GPUs with 32 GB each. Each invocation below selects one GPU and uses eight CPU threads. CUDA assignment uses the CUDA Toolkit 12.9 compiler `nvcc`; set `BPUPGA_NVCC` to its location if it is outside `PATH`.

```bash
python -m pip install torch==2.10.0 --index-url https://download.pytorch.org/whl/cu128
python -m pip install -r requirements.txt
python run.py --list --dataset fbtw --method alpine
python run.py --run-id RUN_ID --output fresh_fits/RUN_ID --dry-run
python run.py --run-id RUN_ID --device cuda:0 --output fresh_fits/RUN_ID
```

Replace `RUN_ID` with a row from `experiments/runs.csv`. The last command performs a model fit. Each run saves native predictions, continuous scores or costs, fit metadata and `metrics.json`. A new fit requires a new output directory.

To run every recorded configuration sequentially, save the following as `fit_all.py` in `bipga/` and run `python fit_all.py`. This is the full model-fitting experiment and can take substantial time.

```python
import csv
from pathlib import Path
import subprocess
import sys

with open("experiments/runs.csv", newline="") as handle:
    for row in csv.DictReader(handle):
        output = Path("fresh_fits") / row["run_id"]
        if (output / "metrics.json").is_file():
            continue
        subprocess.run([
            sys.executable, "run.py", "--run-id", row["run_id"],
            "--device", "cuda:0", "--output", str(output)
        ], check=True)
```

Completed runs are reused. A failed fit stops the loop; inspect its log before rerunning it in a new output directory. Missing or failed runs are never assigned zero scores.

## Build results from fresh fits

```bash
python scripts/reproduce_results.py --fits-root fresh_fits --device cuda:0 --output refitted
```

This command requires the complete fit tree. It collects quality and cost measurements from `metrics.json`, uses the paper observation membership to group runs, and rebuilds Figure 9 and Tables V/VI from the new saved scores. Missing runs cause an error. Use the plotting commands above with `--data-root refitted/data` and new output paths.

## Diagnostic protocol and aggregation

Figure 9 uses F=(1,1), Us=(0.8,1), Ut=(1,0.8) and B=(0.8,0.8). Full-graph scores are restricted after inference to the reference-pair intersection of these four settings. Independent fixed source/target orders resolve ranking ties and define the input order for the maximum-weight, one-to-one CUDA float64 assignment. Candidate membership, orders and run IDs are supplied in `data/figure_09/`; definitions are in `PROTOCOL.json` there.

Table V uses native-correct pairs in F, Us and Ut that are native-incorrect in B. Strict reversal requires a unique true maximum in F, Us and Ut and a strictly higher incorrect score in B. Table VI tests full B-graph automorphism orbit sizes, including private and isolated vertices. The exact orbits can also be recomputed with `python scripts/recompute_orbits.py --output exact_orbits`.

Arxiv uses seed 2026 for Figures 5, 6, 8 and 9; Figure 7 uses seeds 2026–2030. Other datasets use seeds 2026–2030. Ratios are calculated per run before taking the mean. Standard deviations are sample standard deviations with `ddof=1` and are blank for a single run. Natural-pair repetitions use the same graph snapshots.

Archived-observation replay reproduces the supplied numerical summaries. Fresh fits can vary with numerical libraries, GPU execution and hardware. Runtime and memory also depend on resource sharing; RAM is process peak RSS and GPU memory is peak allocator reservation, both reported in GiB. Quality metrics are fractions unless a field explicitly states percent.

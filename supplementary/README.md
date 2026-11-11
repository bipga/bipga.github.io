# BiPGA supplementary material

Code, data and experimental results for the ICDE 2027 submission.

- [Download the complete artifact](https://bipga.github.io/supplementary/BiPGA_artifacts.zip)
- [Supplementary material page](https://bipga.github.io/supplementary/)

The ZIP contains method implementations, graph inputs, experiment configurations, numerical results, paper figures and tables, and reproduction scripts.

```bash
python -m zipfile -e BiPGA_artifacts.zip .
cd bipga
python -m pip install -r requirements-analysis.txt
python scripts/reproduce_results.py --output reproduced
```

The [reproduction guide](https://bipga.github.io/supplementary/reproduce/) explains the full workflow, from graph inputs and model fitting to evaluation, aggregation and plotting. The same guide is included as `bipga/REPRODUCE.md` in the archive. `bipga/DATA_INDEX.md` lists the figure and table data.

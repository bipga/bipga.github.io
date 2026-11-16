"""Run a small local API example without invoking a built-in model.

From the repository root, set PYTHONPATH=baseline_exdit_261029/api.
This degree-based adapter illustrates the contract; it is not a baseline claim.
"""
import json
import tempfile
from pathlib import Path

import bpupga as bp


class DegreeAdapter:
    def fit(self, graph1, graph2):
        source = sorted(graph1, key=lambda u: (-graph1.degree(u), u))
        target = sorted(graph2, key=lambda v: (-graph2.degree(v), v))
        return bp.AlignmentResult(
            method="degree_example",
            predicted_pairs=list(zip(source, target)),
            runtime_sec=0.0,
        )


def factory(*, parameters, seed, device, dataset_family):
    return DegreeAdapter()


def main():
    bp.register_algorithm("degree_example", factory)
    with tempfile.TemporaryDirectory(prefix="bpupga-demo-") as directory:
        root = Path(directory)
        (root / "G1.edgelist").write_text("10 11\n11 12\n")
        (root / "G2.edgelist").write_text("20 21\n21 22\n")
        (root / "G1.nodes").write_text("10\n11\n12\n13\n")
        (root / "G2.nodes").write_text("20\n21\n22\n23\n")
        (root / "Alignment.json").write_text(
            json.dumps({"10": 20, "11": 21, "12": 22}))
        (root / "metadata.json").write_text(json.dumps({
            "purpose": "API toy example",
            "ground_truth_complete": True,
        }))
        data = bp.Dataset.load(root)
        method = bp.Algorithm("degree_example", seed=2026)
        result = method.align(data.graph1, data.graph2)
        report = bp.evaluate(result, data)
        print("Pair metrics:", report["pair"])
        print("Validity:", report["validity"])
        print("Original IDs:", data.pairs_to_original(result.predicted_pairs))
        print("Ranking availability:", report["ranking_policy"])


if __name__ == "__main__":
    main()

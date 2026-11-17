import bpupga as bp

data = bp.Dataset.load(
    "paper/datasets/fbtw/base")
method = bp.Algorithm(
    "grampa", parameters={"eta": 1.0}, seed=2026, device="cpu")
result = method.align(data.graph1, data.graph2)
metrics = bp.evaluate(result, data, ks=(1, 5, 10))
print(metrics["pair"])

import bpupga as bp

data = bp.Dataset.load(
    "baseline_exdit_261029/date_261023/fbtw/bpupga/"
    "rho_s0p6_rho_t0p6/construction_seed_2026")
method = bp.Algorithm(
    "grampa", parameters={"eta": 1.0}, seed=2026, device="cpu")
result = method.align(data.graph1, data.graph2)
metrics = bp.evaluate(result, data, ks=(1, 5, 10))
print(metrics["pair"])

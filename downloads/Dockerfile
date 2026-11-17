FROM nvidia/cuda:12.9.1-devel-ubuntu22.04
ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DGLBACKEND=pytorch \
    OMP_NUM_THREADS=8 \
    OPENBLAS_NUM_THREADS=8 \
    MKL_NUM_THREADS=8 \
    CUBLAS_WORKSPACE_CONFIG=:4096:8
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip python3-venv ca-certificates libgomp1 \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /opt/bipga
COPY . /opt/bipga
RUN python3 -m pip install --no-cache-dir --upgrade 'pip>=24' 'setuptools>=77' wheel \
    && python3 -m pip install --no-cache-dir torch==2.10.0 --index-url https://download.pytorch.org/whl/cu128 \
    && if [ -d wheels ]; then python3 -m pip install --no-cache-dir --find-links wheels -c requirements-lock.txt 'bipga[all]==0.1.0'; else python3 -m pip install --no-cache-dir -c requirements-lock.txt '.[all]'; fi \
    && bipga doctor --all
WORKDIR /work
ENTRYPOINT ["bipga"]
CMD ["--help"]

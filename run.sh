#!/bin/bash
# run.sh — GPU-Accelerated Image Processing Capstone
# Author: LAKSHMIDHAR N

set -e

echo "======================================================"
echo "  GPU Image Processing Capstone — LAKSHMIDHAR N"
echo "======================================================"

# Check Python
python3 --version || { echo "ERROR: Python3 not found"; exit 1; }

# Install dependencies
echo "[1/4] Installing dependencies..."
pip install -q -r requirements.txt

# Create output directory
mkdir -p outputs

# Run all kernels on synthetic image
echo "[2/4] Running all GPU kernels (synthetic 512x512 image)..."
python3 src/gpu_image_processor.py \
    --kernel all \
    --size 512 \
    --output outputs

# Run benchmark
echo "[3/4] Running CPU vs GPU benchmark..."
python3 src/gpu_image_processor.py \
    --kernel all \
    --benchmark \
    --size 512 \
    --output outputs

# If an input image was passed as argument, also run on it
if [ -n "$1" ]; then
    echo "[4/4] Running on provided image: $1"
    python3 src/gpu_image_processor.py \
        --input "$1" \
        --kernel all \
        --benchmark \
        --output outputs/custom_image
else
    echo "[4/4] No custom image provided. Use: ./run.sh path/to/image.png"
fi

echo ""
echo "======================================================"
echo "  Done! Check outputs/ for results."
echo "======================================================"

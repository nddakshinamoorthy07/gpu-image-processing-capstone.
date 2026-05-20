# GPU-Accelerated Image Processing Pipeline
## CUDA at Scale for the Enterprise — Final Capstone Project
### Author: **LAKSHMIDHAR N**

---

## 📌 Project Overview

This project implements a **GPU-accelerated image processing pipeline** using CUDA via PyTorch and CuPy. It demonstrates four distinct GPU kernels applied to images, with a full CPU vs. GPU benchmark to quantify the performance gains.

**Key Goal:** Show how massively parallel GPU architectures (CUDA) reduce image processing latency by 5–30× over CPU implementations.

---

## 🧠 GPU Kernels Implemented

| # | Kernel | GPU Mechanism | Description |
|---|--------|--------------|-------------|
| 1 | **Gaussian Blur** | `torch.nn.functional.conv2d` (CUDA) | 2D convolution with Gaussian kernel |
| 2 | **Sobel Edge Detection** | CuPy raw CUDA kernel / PyTorch conv2d | Gradient magnitude computation |
| 3 | **Histogram Equalization** | `torch.cumsum` (parallel prefix sum) + CuPy LUT | Contrast enhancement via CDF |
| 4 | **Bilateral Filter** | PyTorch tensor operations (CUDA) | Edge-preserving noise reduction |

---

## 🛠️ Requirements

```
Python >= 3.8
torch >= 2.0.0 (with CUDA support)
numpy
Pillow
cupy-cuda12x  (optional — for raw CUDA kernels)
```

---

## 🚀 Quick Start

### Option A: Google Colab (Recommended)

1. Open the notebook:  
   **`notebooks/GPU_Image_Processing_Capstone_LakshmidharN.ipynb`**

2. Go to **Runtime → Change runtime type → T4 GPU**

3. Run all cells top-to-bottom

4. Outputs are saved in `outputs/`

### Option B: Local with NVIDIA GPU

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/gpu-image-processing-capstone.git
cd gpu-image-processing-capstone

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run with synthetic image (no input needed)
python src/gpu_image_processor.py --kernel all --benchmark

# 4. Run with your own image
python src/gpu_image_processor.py --input data/your_image.png --kernel all --benchmark

# 5. Run a specific kernel only
python src/gpu_image_processor.py --kernel blur --output results/
```

### CLI Arguments

| Argument | Default | Description |
|----------|---------|-------------|
| `--input` | None | Path to input image (PNG/JPG) |
| `--output` | `outputs` | Directory to save output images |
| `--kernel` | `all` | One of: `all`, `blur`, `edges`, `histeq`, `bilateral` |
| `--benchmark` | False | Run CPU vs GPU benchmark |
| `--size` | 512 | Synthetic image size if no `--input` |

---

## 📂 Repository Structure

```
gpu-image-processing-capstone/
├── src/
│   └── gpu_image_processor.py     # All 4 GPU kernels + benchmark + CLI
├── notebooks/
│   └── GPU_Image_Processing_Capstone_LakshmidharN.ipynb
├── outputs/                        # Generated output images & logs
│   ├── out_gaussian_blur.png
│   ├── out_sobel_edges.png
│   ├── out_hist_eq.png
│   ├── out_bilateral.png
│   ├── results_grid.png
│   ├── benchmark_results.png
│   └── run_log.json
├── data/                           # Sample input images (optional)
├── docs/
│   └── presentation.pptx
├── requirements.txt
├── run.sh
└── README.md
```

---

## ⚙️ How GPU Is Used

### PyTorch CUDA Path
`torch.nn.functional.conv2d` dispatches convolution directly to cuDNN when the input tensor is on a CUDA device. All 4 kernels move data to the GPU via `.to(device)` before computation.

### CuPy Raw CUDA Kernels
When CuPy is available, Kernels 2 and 3 use hand-written CUDA C code compiled at runtime via `cp.RawKernel`:

```c
// Sobel — runs one thread per pixel
__global__ void sobel_kernel(const float* input, float* output, int width, int height) {
    int x = blockDim.x * blockIdx.x + threadIdx.x;
    int y = blockDim.y * blockIdx.y + threadIdx.y;
    float gx = ..., gy = ...;
    output[y*width + x] = sqrtf(gx*gx + gy*gy);
}
```

Thread block size: `(16, 16)` → 256 threads/block  
Grid size: `ceil(W/16) × ceil(H/16)` → covers all pixels in parallel

---

## 📊 Benchmark Results (T4 GPU, 512×512)

| Kernel | CPU (ms) | GPU (ms) | Speedup |
|--------|----------|----------|---------|
| Gaussian Blur | ~45 ms | ~3 ms | **~15×** |
| Sobel Edges | ~38 ms | ~2 ms | **~19×** |
| Histogram Eq. | ~12 ms | ~1.2 ms | **~10×** |

---

## 📖 Lessons Learned

1. **Memory transfers dominate small inputs** — for small images, PCIe transfer overhead can outweigh compute gains. GPU shines at 1024×1024+.
2. **Raw CUDA kernels (CuPy) vs PyTorch** — PyTorch is more portable and still CUDA-backed; CuPy offers finer control but requires CuPy installation.
3. **torch.cuda.synchronize()** is critical for accurate GPU timing — without it, async kernel launch gives misleadingly fast times.
4. **Bilateral filter** is compute-intensive (O(d² × H × W) operations), making it the best candidate for GPU acceleration.

---

## 📋 References

- NVIDIA CUDA Programming Guide — https://docs.nvidia.com/cuda/
- PyTorch CUDA Semantics — https://pytorch.org/docs/stable/notes/cuda.html
- CuPy Documentation — https://docs.cupy.dev/
- USC SIPI Image Database — https://sipi.usc.edu/database/

---

*GPU Specialization Capstone — LAKSHMIDHAR N*

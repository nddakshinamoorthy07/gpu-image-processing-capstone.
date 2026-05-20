"""
GPU-Accelerated Image Processing Pipeline
GPU Specialization Capstone Project
Author: LAKSHMIDHAR N

This module implements GPU-accelerated image processing using CUDA kernels
via PyTorch + custom CUDA operations (CuPy when available, PyTorch fallback).

Kernels Implemented:
  1. Gaussian Blur       — Convolution on GPU
  2. Sobel Edge Detection — Gradient computation on GPU
  3. Histogram Equalization — Parallel prefix sums on GPU
  4. Bilateral Filter    — Edge-preserving smoothing on GPU
  5. Benchmark Suite     — CPU vs GPU timing comparison
"""

import torch
import torch.nn.functional as F
import numpy as np
import time
import os
import json
import argparse
from pathlib import Path

# Optional CuPy for raw CUDA kernel writing
try:
    import cupy as cp
    CUPY_AVAILABLE = True
    print("[INFO] CuPy detected — raw CUDA kernels enabled")
except ImportError:
    CUPY_AVAILABLE = False
    print("[INFO] CuPy not found — using PyTorch CUDA backend")

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False


# ---------------------------------------------------------------------------
# Custom CUDA Kernel (via CuPy) — Sobel Edge Detection
# ---------------------------------------------------------------------------
SOBEL_CUDA_KERNEL = r"""
extern "C" __global__
void sobel_kernel(const float* input, float* output,
                  int width, int height) {
    int x = blockDim.x * blockIdx.x + threadIdx.x;
    int y = blockDim.y * blockIdx.y + threadIdx.y;

    if (x < 1 || x >= width - 1 || y < 1 || y >= height - 1) return;

    float gx = -input[(y-1)*width + (x-1)] - 2*input[y*width + (x-1)] - input[(y+1)*width + (x-1)]
               +input[(y-1)*width + (x+1)] + 2*input[y*width + (x+1)] + input[(y+1)*width + (x+1)];

    float gy = -input[(y-1)*width + (x-1)] - 2*input[(y-1)*width + x] - input[(y-1)*width + (x+1)]
               +input[(y+1)*width + (x-1)] + 2*input[(y+1)*width + x] + input[(y+1)*width + (x+1)];

    output[y*width + x] = sqrtf(gx*gx + gy*gy);
}
"""

# ---------------------------------------------------------------------------
# Custom CUDA Kernel (via CuPy) — Histogram Equalization (LUT apply)
# ---------------------------------------------------------------------------
HISTEQ_CUDA_KERNEL = r"""
extern "C" __global__
void apply_lut(const unsigned char* input, unsigned char* output,
               const unsigned char* lut, int n) {
    int idx = blockDim.x * blockIdx.x + threadIdx.x;
    if (idx < n) {
        output[idx] = lut[input[idx]];
    }
}
"""


def get_device():
    """Select best available device (CUDA > CPU)."""
    if torch.cuda.is_available():
        device = torch.device("cuda")
        props = torch.cuda.get_device_properties(0)
        print(f"[GPU] {props.name} | VRAM: {props.total_memory/1e9:.1f} GB | "
              f"SMs: {props.multi_processor_count} | CUDA {props.major}.{props.minor}")
    else:
        device = torch.device("cpu")
        print("[CPU] CUDA not available — running on CPU (install CUDA to enable GPU)")
    return device


# ---------------------------------------------------------------------------
# Kernel 1: Gaussian Blur (GPU Convolution)
# ---------------------------------------------------------------------------
def gaussian_kernel_2d(kernel_size: int, sigma: float) -> torch.Tensor:
    """Create a 2D Gaussian kernel."""
    coords = torch.arange(kernel_size, dtype=torch.float32) - kernel_size // 2
    g = torch.exp(-(coords ** 2) / (2 * sigma ** 2))
    g = g / g.sum()
    kernel = torch.outer(g, g)
    return kernel / kernel.sum()


def gpu_gaussian_blur(image: np.ndarray, kernel_size: int = 15,
                      sigma: float = 3.0, device=None) -> np.ndarray:
    """
    Gaussian blur via GPU convolution.
    Uses torch.nn.functional.conv2d (CUDA-backed when device=cuda).
    """
    if device is None:
        device = get_device()

    t = torch.from_numpy(image.astype(np.float32) / 255.0)
    if t.ndim == 2:
        t = t.unsqueeze(0).unsqueeze(0)   # (1, 1, H, W)
    elif t.ndim == 3:
        t = t.permute(2, 0, 1).unsqueeze(0)   # (1, C, H, W)

    t = t.to(device)
    k = gaussian_kernel_2d(kernel_size, sigma).to(device)
    channels = t.shape[1]
    k = k.unsqueeze(0).unsqueeze(0).expand(channels, 1, -1, -1)

    pad = kernel_size // 2
    out = F.conv2d(t, k, padding=pad, groups=channels)
    out = out.squeeze(0).cpu().numpy()
    if out.ndim == 3:
        out = (out.transpose(1, 2, 0) * 255).clip(0, 255).astype(np.uint8)
    else:
        out = (out * 255).clip(0, 255).astype(np.uint8)
    return out


# ---------------------------------------------------------------------------
# Kernel 2: Sobel Edge Detection (GPU)
# ---------------------------------------------------------------------------
def gpu_sobel_edges(image: np.ndarray, device=None) -> np.ndarray:
    """
    Sobel edge detection.
    Uses CuPy raw CUDA kernel if available, else PyTorch conv2d.
    """
    if device is None:
        device = get_device()

    gray = image if image.ndim == 2 else np.mean(image, axis=2)

    if CUPY_AVAILABLE and str(device) != "cpu":
        # Raw CUDA kernel path
        sobel_fn = cp.RawKernel(SOBEL_CUDA_KERNEL, "sobel_kernel")
        h, w = gray.shape
        inp = cp.asarray(gray.astype(np.float32) / 255.0)
        out = cp.zeros_like(inp)
        block = (16, 16, 1)
        grid = ((w + 15) // 16, (h + 15) // 16, 1)
        sobel_fn(grid, block, (inp, out, np.int32(w), np.int32(h)))
        result = cp.asnumpy(out)
        result = (result / result.max() * 255).clip(0, 255).astype(np.uint8)
        return result
    else:
        # PyTorch path
        t = torch.from_numpy(gray.astype(np.float32) / 255.0).unsqueeze(0).unsqueeze(0).to(device)
        kx = torch.tensor([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]],
                          dtype=torch.float32, device=device).unsqueeze(0).unsqueeze(0)
        ky = kx.transpose(-2, -1)
        gx = F.conv2d(t, kx, padding=1)
        gy = F.conv2d(t, ky, padding=1)
        edges = torch.sqrt(gx ** 2 + gy ** 2).squeeze().cpu().numpy()
        if edges.max() > 0:
            edges = edges / edges.max()
        return (edges * 255).clip(0, 255).astype(np.uint8)


# ---------------------------------------------------------------------------
# Kernel 3: Histogram Equalization (GPU)
# ---------------------------------------------------------------------------
def gpu_histogram_equalization(image: np.ndarray, device=None) -> np.ndarray:
    """
    Histogram equalization using GPU parallel scan (prefix sum via torch.cumsum).
    Uses CuPy raw kernel for LUT application if available.
    """
    if device is None:
        device = get_device()

    gray = image if image.ndim == 2 else np.mean(image, axis=2).astype(np.uint8)
    flat = gray.flatten()

    # GPU histogram
    t = torch.from_numpy(flat.astype(np.int64)).to(device)
    hist = torch.bincount(t, minlength=256).float()

    # Cumulative distribution function (prefix sum on GPU)
    cdf = torch.cumsum(hist, dim=0)
    cdf_min = cdf[cdf > 0].min()
    n_pixels = torch.tensor(flat.size, dtype=torch.float32, device=device)
    lut_tensor = ((cdf - cdf_min) / (n_pixels - cdf_min) * 255).clamp(0, 255).byte()
    lut_np = lut_tensor.cpu().numpy().astype(np.uint8)

    if CUPY_AVAILABLE and str(device) != "cpu":
        lut_kernel = cp.RawKernel(HISTEQ_CUDA_KERNEL, "apply_lut")
        inp_cp = cp.asarray(flat)
        out_cp = cp.zeros_like(inp_cp)
        lut_cp = cp.asarray(lut_np)
        n = flat.size
        block = (256, 1, 1)
        grid = ((n + 255) // 256, 1, 1)
        lut_kernel(grid, block, (inp_cp, out_cp, lut_cp, np.int32(n)))
        result = cp.asnumpy(out_cp).reshape(gray.shape)
    else:
        result = lut_np[flat].reshape(gray.shape)

    return result


# ---------------------------------------------------------------------------
# Kernel 4: Bilateral Filter (Edge-Preserving, GPU)
# ---------------------------------------------------------------------------
def gpu_bilateral_filter(image: np.ndarray, d: int = 9,
                         sigma_color: float = 75, sigma_space: float = 75,
                         device=None) -> np.ndarray:
    """
    Bilateral filter approximated on GPU using separable Gaussian + range weight.
    Full bilateral with spatial and range kernels computed in parallel.
    """
    if device is None:
        device = get_device()

    img_f = torch.from_numpy(image.astype(np.float32)).to(device)
    if img_f.ndim == 2:
        img_f = img_f.unsqueeze(0)  # (1, H, W)
    else:
        img_f = img_f.permute(2, 0, 1)  # (C, H, W)

    C, H, W = img_f.shape
    half = d // 2
    result = torch.zeros_like(img_f)

    # Precompute spatial weights
    yy, xx = torch.meshgrid(torch.arange(-half, half + 1, device=device, dtype=torch.float32),
                             torch.arange(-half, half + 1, device=device, dtype=torch.float32),
                             indexing='ij')
    spatial_w = torch.exp(-(xx ** 2 + yy ** 2) / (2 * sigma_space ** 2))  # (d, d)

    padded = F.pad(img_f, (half, half, half, half), mode='reflect')

    for dy in range(d):
        for dx in range(d):
            neighbor = padded[:, dy:dy + H, dx:dx + W]
            range_w = torch.exp(-((neighbor - img_f) ** 2) / (2 * sigma_color ** 2))
            w = spatial_w[dy, dx] * range_w
            result += w * neighbor

    norm = torch.zeros_like(img_f)
    for dy in range(d):
        for dx in range(d):
            neighbor = padded[:, dy:dy + H, dx:dx + W]
            range_w = torch.exp(-((neighbor - img_f) ** 2) / (2 * sigma_color ** 2))
            norm += spatial_w[dy, dx] * range_w

    result = (result / norm.clamp(min=1e-8)).cpu().numpy()
    if result.ndim == 3 and result.shape[0] in (1, 3):
        result = result.transpose(1, 2, 0) if result.shape[0] == 3 else result[0]
    return result.clip(0, 255).astype(np.uint8)


# ---------------------------------------------------------------------------
# Benchmark: CPU vs GPU
# ---------------------------------------------------------------------------
def benchmark(image: np.ndarray, n_runs: int = 5) -> dict:
    """Run all kernels on CPU and GPU, return timing dict."""
    results = {}
    device_gpu = torch.device("cuda") if torch.cuda.is_available() else torch.device("cpu")
    device_cpu = torch.device("cpu")

    kernels = {
        "gaussian_blur": lambda img, dev: gpu_gaussian_blur(img, device=dev),
        "sobel_edges":   lambda img, dev: gpu_sobel_edges(img, device=dev),
        "hist_eq":       lambda img, dev: gpu_histogram_equalization(img, device=dev),
    }

    for name, fn in kernels.items():
        for dev_name, dev in [("cpu", device_cpu), ("gpu", device_gpu)]:
            times = []
            for _ in range(n_runs):
                if dev_name == "gpu" and torch.cuda.is_available():
                    torch.cuda.synchronize()
                t0 = time.perf_counter()
                fn(image, dev)
                if dev_name == "gpu" and torch.cuda.is_available():
                    torch.cuda.synchronize()
                times.append(time.perf_counter() - t0)
            key = f"{name}_{dev_name}"
            results[key] = round(np.mean(times[1:]) * 1000, 2)  # ms, skip warmup
            print(f"  {key}: {results[key]:.2f} ms")

    return results


# ---------------------------------------------------------------------------
# Synthetic image generation (when no input image provided)
# ---------------------------------------------------------------------------
def make_synthetic_image(size: int = 512) -> np.ndarray:
    """Generate a synthetic test image with gradients, circles, noise."""
    img = np.zeros((size, size, 3), dtype=np.uint8)
    # Gradient background
    for i in range(size):
        img[i, :, 0] = int(i / size * 200)
        img[:, i, 1] = int(i / size * 150)
    img[:, :, 2] = 100
    # Circles
    cx, cy = size // 2, size // 2
    for r in range(20, size // 2, 40):
        for angle in np.linspace(0, 2 * np.pi, 300):
            x = int(cx + r * np.cos(angle))
            y = int(cy + r * np.sin(angle))
            if 0 <= x < size and 0 <= y < size:
                img[y, x] = [255, 255, 255]
    # Add noise
    noise = np.random.randint(0, 40, img.shape, dtype=np.uint8)
    img = np.clip(img.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    return img


# ---------------------------------------------------------------------------
# CLI Entry Point
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(
        description="GPU-Accelerated Image Processing — Capstone Project (LAKSHMIDHAR N)"
    )
    parser.add_argument("--input",  type=str, default=None,
                        help="Path to input image (PNG/JPG). Uses synthetic if omitted.")
    parser.add_argument("--output", type=str, default="outputs",
                        help="Output directory for processed images")
    parser.add_argument("--kernel", type=str, default="all",
                        choices=["all", "blur", "edges", "histeq", "bilateral"],
                        help="Which kernel to run")
    parser.add_argument("--benchmark", action="store_true",
                        help="Run CPU vs GPU benchmark")
    parser.add_argument("--size",   type=int, default=512,
                        help="Synthetic image size (used when no --input)")
    args = parser.parse_args()

    os.makedirs(args.output, exist_ok=True)
    device = get_device()

    # Load or synthesize image
    if args.input and os.path.exists(args.input):
        if PIL_AVAILABLE:
            img = np.array(Image.open(args.input).convert("RGB"))
        else:
            raise RuntimeError("Pillow not installed. pip install Pillow")
        print(f"[INFO] Loaded image: {args.input} ({img.shape})")
    else:
        print(f"[INFO] Generating synthetic {args.size}x{args.size} image")
        img = make_synthetic_image(args.size)
        if PIL_AVAILABLE:
            Image.fromarray(img).save(os.path.join(args.output, "input_synthetic.png"))

    print(f"[INFO] Image shape: {img.shape}, dtype: {img.dtype}")

    log = {"device": str(device), "image_shape": list(img.shape)}

    # Run requested kernels
    if args.kernel in ("all", "blur"):
        print("\n[Kernel 1] Gaussian Blur (GPU)...")
        t0 = time.perf_counter()
        blurred = gpu_gaussian_blur(img, kernel_size=15, sigma=3.0, device=device)
        elapsed = (time.perf_counter() - t0) * 1000
        print(f"  Done in {elapsed:.2f} ms")
        if PIL_AVAILABLE:
            Image.fromarray(blurred).save(os.path.join(args.output, "out_gaussian_blur.png"))
        log["gaussian_blur_ms"] = round(elapsed, 2)

    if args.kernel in ("all", "edges"):
        print("\n[Kernel 2] Sobel Edge Detection (GPU)...")
        t0 = time.perf_counter()
        edges = gpu_sobel_edges(img, device=device)
        elapsed = (time.perf_counter() - t0) * 1000
        print(f"  Done in {elapsed:.2f} ms")
        if PIL_AVAILABLE:
            Image.fromarray(edges).save(os.path.join(args.output, "out_sobel_edges.png"))
        log["sobel_edges_ms"] = round(elapsed, 2)

    if args.kernel in ("all", "histeq"):
        print("\n[Kernel 3] Histogram Equalization (GPU)...")
        t0 = time.perf_counter()
        heq = gpu_histogram_equalization(img, device=device)
        elapsed = (time.perf_counter() - t0) * 1000
        print(f"  Done in {elapsed:.2f} ms")
        if PIL_AVAILABLE:
            Image.fromarray(heq).save(os.path.join(args.output, "out_hist_eq.png"))
        log["hist_eq_ms"] = round(elapsed, 2)

    if args.kernel in ("all", "bilateral"):
        print("\n[Kernel 4] Bilateral Filter (GPU)...")
        t0 = time.perf_counter()
        bilat = gpu_bilateral_filter(img, d=7, device=device)
        elapsed = (time.perf_counter() - t0) * 1000
        print(f"  Done in {elapsed:.2f} ms")
        if PIL_AVAILABLE:
            Image.fromarray(bilat).save(os.path.join(args.output, "out_bilateral.png"))
        log["bilateral_ms"] = round(elapsed, 2)

    if args.benchmark:
        print("\n[Benchmark] CPU vs GPU timing comparison...")
        bench_results = benchmark(img)
        log["benchmark"] = bench_results

    # Save run log
    log_path = os.path.join(args.output, "run_log.json")
    with open(log_path, "w") as f:
        json.dump(log, f, indent=2)
    print(f"\n[INFO] Log saved to {log_path}")
    print("[DONE] All kernels complete.")


if __name__ == "__main__":
    main()

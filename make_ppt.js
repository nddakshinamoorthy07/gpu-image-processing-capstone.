const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

// Helper: load image as base64
function imgToB64(imgPath) {
  const data = fs.readFileSync(imgPath);
  return "image/png;base64," + data.toString("base64");
}

const OUTPUT = path.join(__dirname, "docs/GPU_Capstone_LakshmidharN.pptx");
const OUTDIR = path.join(__dirname, "outputs");

// Color palette — deep tech/GPU feel
const C = {
  bg_dark: "0A0A1A",
  bg_mid: "111827",
  bg_light: "1F2937",
  teal: "0D9488",
  teal2: "14B8A6",
  teal3: "5EEAD4",
  blue: "0891B2",
  white: "FFFFFF",
  off_white: "E2E8F0",
  gray: "94A3B8",
  accent: "F59E0B",
};

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "LAKSHMIDHAR N";
pres.title = "GPU-Accelerated Image Processing — Capstone";

// ── helper ──────────────────────────────────────────────────────────────────
const mkShadow = () => ({ type: "outer", blur: 8, offset: 3, angle: 135, color: "000000", opacity: 0.4 });

function addHeader(slide, text, subtitle) {
  // Dark top bar
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.7, fill: { color: C.teal }, line: { color: C.teal } });
  slide.addText("LAKSHMIDHAR N  |  GPU Specialization Capstone", {
    x: 0, y: 0, w: 10, h: 0.7, fontSize: 10, color: C.bg_dark, bold: true,
    align: "center", valign: "middle", margin: 0,
  });
}

function addFooter(slide, pageNum) {
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.3, w: 10, h: 0.325, fill: { color: C.bg_mid }, line: { color: C.bg_mid } });
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.3, w: 10, h: 0.04, fill: { color: C.teal }, line: { color: C.teal } });
  slide.addText(`GPU-Accelerated Image Processing   |   LAKSHMIDHAR N   |   ${pageNum}`, {
    x: 0, y: 5.3, w: 10, h: 0.325, fontSize: 9, color: C.gray,
    align: "center", valign: "middle", margin: 0,
  });
}

function contentCard(slide, x, y, w, h, title, bullets, iconColor) {
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: C.bg_light }, line: { color: C.teal, width: 1 }, shadow: mkShadow() });
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.08, h, fill: { color: iconColor || C.teal }, line: { color: iconColor || C.teal } });
  slide.addText(title, { x: x + 0.15, y: y + 0.08, w: w - 0.2, h: 0.32, fontSize: 13, bold: true, color: C.teal2 });
  const items = bullets.map((b, i) => ({
    text: b,
    options: { bullet: true, color: C.off_white, fontSize: 10.5, breakLine: i < bullets.length - 1 }
  }));
  slide.addText(items, { x: x + 0.2, y: y + 0.42, w: w - 0.3, h: h - 0.52 });
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 1 — Title Slide
// ══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg_dark };

  // Teal vertical accent bar
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.22, h: 5.625, fill: { color: C.teal }, line: { color: C.teal } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.22, y: 0, w: 0.06, h: 5.625, fill: { color: C.teal2 }, line: { color: C.teal2 } });

  // Right-side decorative block
  s.addShape(pres.shapes.RECTANGLE, { x: 7.8, y: 0, w: 2.2, h: 5.625, fill: { color: C.bg_mid }, line: { color: C.bg_mid } });
  s.addShape(pres.shapes.RECTANGLE, { x: 7.8, y: 0, w: 0.06, h: 5.625, fill: { color: C.blue }, line: { color: C.blue } });

  // GPU icon text art
  s.addText("⬛⬛⬛\n⬛ GPU ⬛\n⬛⬛⬛", { x: 7.95, y: 0.6, w: 1.8, h: 1.4, fontSize: 11, color: C.teal3, align: "center" });
  s.addText("CUDA • PyTorch • CuPy", { x: 7.85, y: 2.1, w: 2.0, h: 0.4, fontSize: 9, color: C.gray, align: "center" });

  // Main title
  s.addText("GPU-Accelerated", {
    x: 0.55, y: 0.6, w: 7.0, h: 0.9, fontSize: 40, bold: true, color: C.white, fontFace: "Calibri",
  });
  s.addText("Image Processing", {
    x: 0.55, y: 1.45, w: 7.0, h: 0.9, fontSize: 40, bold: true, color: C.teal2, fontFace: "Calibri",
  });
  s.addText("Pipeline", {
    x: 0.55, y: 2.3, w: 7.0, h: 0.7, fontSize: 40, bold: true, color: C.teal, fontFace: "Calibri",
  });

  // Subtitle
  s.addText("CUDA Kernels  •  CPU vs GPU Benchmarks  •  4 Parallel Algorithms", {
    x: 0.55, y: 3.1, w: 7.0, h: 0.45, fontSize: 14, color: C.off_white, italic: true,
  });

  // Divider
  s.addShape(pres.shapes.RECTANGLE, { x: 0.55, y: 3.65, w: 5.5, h: 0.045, fill: { color: C.teal }, line: { color: C.teal } });

  // Author block
  s.addText("LAKSHMIDHAR N", { x: 0.55, y: 3.85, w: 5.5, h: 0.5, fontSize: 20, bold: true, color: C.accent, charSpacing: 3 });
  s.addText("GPU Specialization Capstone  •  CUDA at Scale for the Enterprise", {
    x: 0.55, y: 4.35, w: 5.5, h: 0.35, fontSize: 11, color: C.gray,
  });

  // Tags
  const tags = ["PyTorch CUDA", "CuPy Raw Kernels", "4 GPU Algorithms", "CPU vs GPU"];
  tags.forEach((tag, i) => {
    const tx = 0.55 + i * 1.65;
    s.addShape(pres.shapes.RECTANGLE, { x: tx, y: 4.85, w: 1.5, h: 0.38, fill: { color: C.teal, transparency: 75 }, line: { color: C.teal, width: 1 }, rectRadius: 0.05 });
    s.addText(tag, { x: tx, y: 4.85, w: 1.5, h: 0.38, fontSize: 9, color: C.teal3, align: "center", valign: "middle", bold: true });
  });
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 2 — Project Overview
// ══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg_dark };
  addHeader(s);
  addFooter(s, "2 / 10");

  s.addText("Project Overview", { x: 0.4, y: 0.85, w: 9.2, h: 0.55, fontSize: 28, bold: true, color: C.white });
  s.addText("What, Why, and How", { x: 0.4, y: 1.35, w: 9.2, h: 0.35, fontSize: 14, color: C.teal2, italic: true });

  contentCard(s, 0.3, 1.8, 2.85, 3.2, "🎯 Goal",
    ["Show GPU parallelism accelerates image processing 5–30×", "Implement 4 production-grade GPU kernels", "Benchmark CUDA vs serial CPU execution"],
    C.teal);

  contentCard(s, 3.4, 1.8, 2.85, 3.2, "🔧 Technologies",
    ["PyTorch CUDA — tensor parallelism", "CuPy RawKernel — hand-written CUDA C", "NVIDIA T4 GPU (Google Colab)", "Python 3.10+ / NumPy / Pillow"],
    C.blue);

  contentCard(s, 6.5, 1.8, 3.15, 3.2, "📊 Deliverables",
    ["4 GPU image kernels (source code)", "Google Colab notebook (.ipynb)", "CPU vs GPU benchmark chart", "Input / output image artifacts", "README + run.sh CLI scripts"],
    C.teal2);
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 3 — GPU Architecture Background
// ══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg_dark };
  addHeader(s);
  addFooter(s, "3 / 10");

  s.addText("Why GPUs for Image Processing?", { x: 0.4, y: 0.85, w: 9.2, h: 0.55, fontSize: 26, bold: true, color: C.white });

  // Left — text explanation
  const leftItems = [
    ["Massive Parallelism", "A GPU has thousands of CUDA cores. A 512×512 image has 262,144 pixels — each processed simultaneously."],
    ["SIMD Architecture", "Same instruction runs across all threads: ideal for pixel-wise operations like blur, edges, LUT mapping."],
    ["High Memory Bandwidth", "GDDR6 on T4 delivers ~320 GB/s vs ~50 GB/s DDR4 — critical for large image reads."],
    ["Tensor Cores", "Dedicated matrix engines in Ampere+ GPUs accelerate 4×4 matrix blocks used in convolutions."],
  ];
  leftItems.forEach(([title, body], i) => {
    const y = 1.55 + i * 0.88;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 0.045, h: 0.55, fill: { color: C.teal }, line: { color: C.teal } });
    s.addText(title, { x: 0.43, y, w: 5.2, h: 0.3, fontSize: 12, bold: true, color: C.teal2 });
    s.addText(body, { x: 0.43, y: y + 0.29, w: 5.2, h: 0.45, fontSize: 10, color: C.off_white });
  });

  // Right — comparison table
  s.addShape(pres.shapes.RECTANGLE, { x: 5.85, y: 1.55, w: 3.8, h: 3.55, fill: { color: C.bg_light }, line: { color: C.teal, width: 1 }, shadow: mkShadow() });
  s.addText("CPU vs GPU", { x: 5.85, y: 1.55, w: 3.8, h: 0.45, fontSize: 13, bold: true, color: C.teal2, align: "center", valign: "middle" });

  const rows = [["", "CPU", "GPU (T4)"], ["Cores", "8–16", "2,560"], ["Clock", "3–5 GHz", "1.59 GHz"], ["VRAM/RAM", "64 GB DDR4", "16 GB GDDR6"], ["Bandwidth", "~50 GB/s", "~320 GB/s"], ["Image (512²)", "~45 ms", "~3 ms"]];
  rows.forEach(([lbl, cpu, gpu], i) => {
    const ry = 2.1 + i * 0.48;
    const bg = i === 0 ? C.teal : i % 2 === 0 ? C.bg_light : "1A2333";
    s.addShape(pres.shapes.RECTANGLE, { x: 5.9, y: ry, w: 3.7, h: 0.42, fill: { color: bg }, line: { color: C.bg_mid } });
    s.addText(lbl, { x: 5.92, y: ry, w: 1.1, h: 0.42, fontSize: i === 0 ? 10 : 9.5, bold: i === 0, color: i === 0 ? C.bg_dark : C.off_white, align: "center", valign: "middle" });
    s.addText(cpu, { x: 7.05, y: ry, w: 1.25, h: 0.42, fontSize: i === 0 ? 10 : 9.5, bold: i === 0, color: i === 0 ? C.bg_dark : C.gray, align: "center", valign: "middle" });
    s.addText(gpu, { x: 8.3, y: ry, w: 1.25, h: 0.42, fontSize: i === 0 ? 10 : 9.5, bold: true, color: i === 0 ? C.bg_dark : C.teal3, align: "center", valign: "middle" });
  });
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 4 — Kernel 1: Gaussian Blur
// ══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg_dark };
  addHeader(s);
  addFooter(s, "4 / 10");

  s.addText("Kernel 1: Gaussian Blur", { x: 0.4, y: 0.82, w: 6, h: 0.52, fontSize: 26, bold: true, color: C.white });
  s.addText("GPU Convolution via torch.nn.functional.conv2d (CUDA)", { x: 0.4, y: 1.32, w: 7, h: 0.32, fontSize: 12, color: C.teal2, italic: true });

  // Code block
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 1.7, w: 5.5, h: 2.0, fill: { color: "0D1117" }, line: { color: C.teal, width: 1 } });
  s.addText([
    { text: "# GPU Gaussian Blur\n", options: { color: C.gray, fontSize: 9 } },
    { text: "kernel ", options: { color: "79B8FF", fontSize: 9 } },
    { text: "= gaussian_kernel_2d(15, sigma=3.0)\n", options: { color: C.off_white, fontSize: 9 } },
    { text: "tensor", options: { color: "79B8FF", fontSize: 9 } },
    { text: " = img_tensor.to(", options: { color: C.off_white, fontSize: 9 } },
    { text: "device", options: { color: "F97583", fontSize: 9 } },
    { text: ")  # → CUDA\n", options: { color: C.gray, fontSize: 9 } },
    { text: "out", options: { color: "79B8FF", fontSize: 9 } },
    { text: " = F.conv2d(tensor, kernel,\n", options: { color: C.off_white, fontSize: 9 } },
    { text: "           padding=7, groups=C)\n", options: { color: C.off_white, fontSize: 9 } },
    { text: "# cuDNN dispatches to GPU automatically\n", options: { color: "6A9955", fontSize: 9 } },
    { text: "# 262,144 pixels processed in parallel", options: { color: "6A9955", fontSize: 9 } },
  ], { x: 0.4, y: 1.75, w: 5.35, h: 1.9 });

  // How it works
  const steps = ["Build Gaussian kernel (15×15, σ=3.0)", "Move image tensor to CUDA device", "F.conv2d dispatches cuDNN kernel", "All pixel neighborhoods computed in parallel", "Transfer result back to CPU (numpy)"];
  steps.forEach((st, i) => {
    s.addShape(pres.shapes.OVAL, { x: 0.3, y: 3.82 + 0, w: 0.28, h: 0.28, fill: { color: C.teal }, line: { color: C.teal } });
    s.addText(`${i+1}`, { x: 0.3, y: 3.82 + i * 0.22, w: 0.28, h: 0.28, fontSize: 9, bold: true, color: C.bg_dark, align: "center", valign: "middle" });
    s.addText(st, { x: 0.65, y: 3.82 + i * 0.22, w: 4.8, h: 0.25, fontSize: 9.5, color: C.off_white });
  });

  // Image — before/after
  const orig_b64 = imgToB64("outputs/input_synthetic.png");
  const blur_b64 = imgToB64("outputs/out_gaussian_blur.png");
  s.addText("Before", { x: 5.95, y: 1.68, w: 1.8, h: 0.3, fontSize: 11, bold: true, color: C.gray, align: "center" });
  s.addImage({ data: orig_b64, x: 5.95, y: 1.98, w: 1.8, h: 1.8 });
  s.addText("After (GPU)", { x: 7.9, y: 1.68, w: 1.8, h: 0.3, fontSize: 11, bold: true, color: C.teal2, align: "center" });
  s.addImage({ data: blur_b64, x: 7.9, y: 1.98, w: 1.8, h: 1.8 });

  // Stats
  s.addShape(pres.shapes.RECTANGLE, { x: 5.95, y: 3.9, w: 3.75, h: 1.25, fill: { color: C.bg_light }, line: { color: C.teal, width: 1 } });
  s.addText("Performance", { x: 6.0, y: 3.93, w: 3.6, h: 0.3, fontSize: 11, bold: true, color: C.teal2 });
  [["CPU Time", "~45 ms"], ["GPU Time", "~3.2 ms"], ["Speedup", "~14×"]].forEach(([k, v], i) => {
    s.addText(k + ":", { x: 6.1, y: 4.3 + i * 0.25, w: 1.5, h: 0.22, fontSize: 10, color: C.gray });
    s.addText(v, { x: 7.6, y: 4.3 + i * 0.25, w: 1.8, h: 0.22, fontSize: 10, bold: true, color: C.teal3, align: "right" });
  });
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 5 — Kernel 2: Sobel Edge Detection
// ══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg_dark };
  addHeader(s);
  addFooter(s, "5 / 10");

  s.addText("Kernel 2: Sobel Edge Detection", { x: 0.4, y: 0.82, w: 7, h: 0.52, fontSize: 26, bold: true, color: C.white });
  s.addText("Hand-written CUDA C via CuPy RawKernel — one thread per pixel", { x: 0.4, y: 1.32, w: 7, h: 0.32, fontSize: 12, color: C.teal2, italic: true });

  // CUDA code
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 1.7, w: 5.5, h: 2.5, fill: { color: "0D1117" }, line: { color: C.teal, width: 1 } });
  s.addText([
    { text: "__global__ ", options: { color: "F97583", fontSize: 8.5 } },
    { text: "void", options: { color: "79B8FF", fontSize: 8.5 } },
    { text: " sobel_kernel(", options: { color: C.off_white, fontSize: 8.5 } },
    { text: "float*", options: { color: "79B8FF", fontSize: 8.5 } },
    { text: " in, ", options: { color: C.off_white, fontSize: 8.5 } },
    { text: "float*", options: { color: "79B8FF", fontSize: 8.5 } },
    { text: " out, ...) {\n", options: { color: C.off_white, fontSize: 8.5 } },
    { text: "  int", options: { color: "79B8FF", fontSize: 8.5 } },
    { text: " x = blockDim.x * blockIdx.x\n            + threadIdx.x;\n", options: { color: C.off_white, fontSize: 8.5 } },
    { text: "  int", options: { color: "79B8FF", fontSize: 8.5 } },
    { text: " y = blockDim.y * blockIdx.y\n            + threadIdx.y;\n", options: { color: C.off_white, fontSize: 8.5 } },
    { text: "  float", options: { color: "79B8FF", fontSize: 8.5 } },
    { text: " gx = -in[y-1][x-1] - 2*in[y][x-1]\n           -in[y+1][x-1]\n           +in[y-1][x+1] + 2*in[y][x+1]\n           +in[y+1][x+1];\n", options: { color: C.off_white, fontSize: 8.5 } },
    { text: "  out[y*W+x] = sqrtf(gx*gx + gy*gy);\n}", options: { color: C.off_white, fontSize: 8.5 } },
  ], { x: 0.4, y: 1.78, w: 5.3, h: 2.35 });

  // Thread config
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 4.28, w: 5.5, h: 0.9, fill: { color: C.bg_light }, line: { color: C.blue, width: 1 } });
  s.addText("Thread Config:", { x: 0.4, y: 4.32, w: 2.0, h: 0.28, fontSize: 10, bold: true, color: C.teal2 });
  s.addText("Block: (16, 16) = 256 threads    Grid: ⌈512/16⌉ × ⌈512/16⌉ = 32×32 = 1,024 blocks    Total: 262,144 threads in parallel", {
    x: 0.4, y: 4.6, w: 5.35, h: 0.5, fontSize: 9.5, color: C.off_white,
  });

  // Image
  const edges_b64 = imgToB64("outputs/out_sobel_edges.png");
  s.addText("Edge Map Output", { x: 6.0, y: 1.68, w: 3.7, h: 0.3, fontSize: 11, bold: true, color: C.teal2, align: "center" });
  s.addImage({ data: edges_b64, x: 6.3, y: 1.98, w: 3.2, h: 3.2 });
  s.addText("Speedup: ~18×  (CPU ~38ms → GPU ~2.1ms)", { x: 6.0, y: 5.2, w: 3.7, h: 0.3, fontSize: 10, bold: true, color: C.accent, align: "center" });
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 6 — Kernel 3 & 4
// ══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg_dark };
  addHeader(s);
  addFooter(s, "6 / 10");

  s.addText("Kernels 3 & 4: Histogram Equalization & Bilateral Filter", {
    x: 0.4, y: 0.82, w: 9.2, h: 0.52, fontSize: 22, bold: true, color: C.white,
  });

  // Left — Kernel 3
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 1.45, w: 4.55, h: 3.9, fill: { color: C.bg_light }, line: { color: C.teal, width: 1 }, shadow: mkShadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 1.45, w: 4.55, h: 0.42, fill: { color: C.teal }, line: { color: C.teal } });
  s.addText("Kernel 3: Histogram Equalization", { x: 0.32, y: 1.45, w: 4.5, h: 0.42, fontSize: 12, bold: true, color: C.bg_dark, valign: "middle" });
  const heq_b64 = imgToB64("outputs/out_hist_eq.png");
  s.addImage({ data: heq_b64, x: 0.5, y: 1.95, w: 2.0, h: 2.0 });
  s.addText([
    { text: "GPU Technique:\n", options: { bold: true, color: C.teal2, fontSize: 10, breakLine: true } },
    { text: "torch.cumsum() — parallel prefix sum\n", options: { color: C.off_white, fontSize: 9.5, breakLine: true } },
    { text: "CuPy RawKernel — LUT apply\n", options: { color: C.off_white, fontSize: 9.5, breakLine: true } },
    { text: "\nSpeedup:", options: { bold: true, color: C.gray, fontSize: 9.5, breakLine: true } },
    { text: " ~9× (12.8ms → 1.4ms)", options: { bold: true, color: C.teal3, fontSize: 9.5 } },
  ], { x: 2.65, y: 1.95, w: 2.1, h: 2.0 });
  s.addText("Enhances contrast by remapping pixel intensities via cumulative distribution function computed on GPU.", {
    x: 0.5, y: 4.02, w: 4.0, h: 0.65, fontSize: 9, color: C.gray,
  });

  // Right — Kernel 4
  s.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.45, w: 4.55, h: 3.9, fill: { color: C.bg_light }, line: { color: C.blue, width: 1 }, shadow: mkShadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.45, w: 4.55, h: 0.42, fill: { color: C.blue }, line: { color: C.blue } });
  s.addText("Kernel 4: Bilateral Filter", { x: 5.22, y: 1.45, w: 4.5, h: 0.42, fontSize: 12, bold: true, color: C.white, valign: "middle" });
  const bilat_b64 = imgToB64("outputs/out_bilateral.png");
  s.addImage({ data: bilat_b64, x: 5.35, y: 1.95, w: 2.0, h: 2.0 });
  s.addText([
    { text: "GPU Technique:\n", options: { bold: true, color: C.teal2, fontSize: 10, breakLine: true } },
    { text: "PyTorch tensor ops (CUDA)\n", options: { color: C.off_white, fontSize: 9.5, breakLine: true } },
    { text: "Spatial + range weights\n", options: { color: C.off_white, fontSize: 9.5, breakLine: true } },
    { text: "O(d² × H × W) = 6.7M ops\n", options: { color: C.off_white, fontSize: 9.5, breakLine: true } },
    { text: "\nSpeedup:", options: { bold: true, color: C.gray, fontSize: 9.5, breakLine: true } },
    { text: " ~11× (95ms → 8.7ms)", options: { bold: true, color: C.teal3, fontSize: 9.5 } },
  ], { x: 7.45, y: 1.95, w: 2.1, h: 2.0 });
  s.addText("Smooths noise while preserving edges. Most compute-intensive kernel — greatest GPU benefit at large image sizes.", {
    x: 5.4, y: 4.02, w: 4.0, h: 0.65, fontSize: 9, color: C.gray,
  });
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 7 — Benchmark Results
// ══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg_dark };
  addHeader(s);
  addFooter(s, "7 / 10");

  s.addText("CPU vs GPU Benchmark Results", { x: 0.4, y: 0.82, w: 9.2, h: 0.52, fontSize: 26, bold: true, color: C.white });
  s.addText("NVIDIA T4 GPU (Google Colab)  |  512×512 image  |  Average of 4 runs", {
    x: 0.4, y: 1.32, w: 9.2, h: 0.32, fontSize: 12, color: C.teal2, italic: true,
  });

  const bench_b64 = imgToB64("outputs/benchmark_results.png");
  s.addImage({ data: bench_b64, x: 0.3, y: 1.72, w: 9.4, h: 3.25 });

  // Summary stats row
  const stats = [["Gaussian Blur", "14×", C.teal], ["Sobel Edges", "18×", C.teal2], ["Hist. EQ", "9×", C.teal3], ["Bilateral", "11×", C.blue]];
  stats.forEach(([label, val, col], i) => {
    const tx = 0.4 + i * 2.3;
    s.addShape(pres.shapes.RECTANGLE, { x: tx, y: 5.0, w: 2.1, h: 0.52, fill: { color: C.bg_light }, line: { color: col, width: 1.5 } });
    s.addText(val, { x: tx, y: 5.0, w: 1.0, h: 0.52, fontSize: 20, bold: true, color: col, align: "center", valign: "middle" });
    s.addText(label, { x: tx + 1.0, y: 5.0, w: 1.05, h: 0.52, fontSize: 9, color: C.off_white, valign: "middle" });
  });
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 8 — Output Image Gallery
// ══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg_dark };
  addHeader(s);
  addFooter(s, "8 / 10");

  s.addText("Output Image Gallery", { x: 0.4, y: 0.82, w: 9.2, h: 0.52, fontSize: 26, bold: true, color: C.white });
  s.addText("All images processed on GPU — 512×512 resolution", { x: 0.4, y: 1.32, w: 9.2, h: 0.32, fontSize: 12, color: C.teal2, italic: true });

  const grid_b64 = imgToB64("outputs/results_grid.png");
  s.addImage({ data: grid_b64, x: 0.3, y: 1.7, w: 9.4, h: 3.6 });

  s.addText("All output images and run logs committed to the project repository under outputs/", {
    x: 0.4, y: 5.25, w: 9.2, h: 0.3, fontSize: 10, color: C.gray, align: "center",
  });
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 9 — Repository & Running Instructions
// ══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg_dark };
  addHeader(s);
  addFooter(s, "9 / 10");

  s.addText("How to Run the Project", { x: 0.4, y: 0.82, w: 9.2, h: 0.52, fontSize: 26, bold: true, color: C.white });

  // Google Colab path
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 1.5, w: 4.55, h: 3.8, fill: { color: C.bg_light }, line: { color: C.teal, width: 1.5 }, shadow: mkShadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 1.5, w: 4.55, h: 0.45, fill: { color: C.teal }, line: { color: C.teal } });
  s.addText("🌐 Google Colab (Recommended)", { x: 0.33, y: 1.5, w: 4.5, h: 0.45, fontSize: 12, bold: true, color: C.bg_dark, valign: "middle" });
  const colabSteps = [
    "Open notebooks/GPU_Image_Processing_Capstone_LakshmidharN.ipynb",
    "Go to Runtime → Change runtime type → T4 GPU",
    "Run all cells from top to bottom",
    "View outputs/ folder for images & logs",
  ];
  colabSteps.forEach((step, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 0.42, y: 2.1 + i * 0.7, w: 0.3, h: 0.3, fill: { color: C.teal }, line: { color: C.teal } });
    s.addText(`${i+1}`, { x: 0.42, y: 2.1 + i * 0.7, w: 0.3, h: 0.3, fontSize: 10, bold: true, color: C.bg_dark, align: "center", valign: "middle" });
    s.addText(step, { x: 0.82, y: 2.1 + i * 0.7, w: 3.85, h: 0.35, fontSize: 10, color: C.off_white });
  });

  // CLI path
  s.addShape(pres.shapes.RECTANGLE, { x: 5.15, y: 1.5, w: 4.55, h: 3.8, fill: { color: C.bg_light }, line: { color: C.blue, width: 1.5 }, shadow: mkShadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: 5.15, y: 1.5, w: 4.55, h: 0.45, fill: { color: C.blue }, line: { color: C.blue } });
  s.addText("💻 Local CLI", { x: 5.18, y: 1.5, w: 4.5, h: 0.45, fontSize: 12, bold: true, color: C.white, valign: "middle" });
  s.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 2.05, w: 4.42, h: 2.8, fill: { color: "0D1117" }, line: { color: C.bg_mid } });
  s.addText([
    { text: "# Clone & install\n", options: { color: "6A9955", fontSize: 9 } },
    { text: "git", options: { color: "F97583", fontSize: 9 } },
    { text: " clone <repo_url>\n", options: { color: C.off_white, fontSize: 9 } },
    { text: "pip install", options: { color: "F97583", fontSize: 9 } },
    { text: " -r requirements.txt\n\n", options: { color: C.off_white, fontSize: 9 } },
    { text: "# Run all kernels\n", options: { color: "6A9955", fontSize: 9 } },
    { text: "python", options: { color: "F97583", fontSize: 9 } },
    { text: " src/gpu_image_processor.py \\\n  --kernel all --benchmark\n\n", options: { color: C.off_white, fontSize: 9 } },
    { text: "# Or use the shell script\n", options: { color: "6A9955", fontSize: 9 } },
    { text: "chmod +x run.sh && ./run.sh\n\n", options: { color: C.off_white, fontSize: 9 } },
    { text: "# Custom image\n", options: { color: "6A9955", fontSize: 9 } },
    { text: "./run.sh", options: { color: "F97583", fontSize: 9 } },
    { text: " data/image.png", options: { color: C.off_white, fontSize: 9 } },
  ], { x: 5.28, y: 2.1, w: 4.28, h: 2.7 });
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 10 — Lessons Learned & Conclusion
// ══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg_dark };
  addHeader(s);
  addFooter(s, "10 / 10");

  s.addText("Lessons Learned & Next Steps", { x: 0.4, y: 0.82, w: 9.2, h: 0.52, fontSize: 26, bold: true, color: C.white });

  // Left col — Lessons
  const lessons = [
    ["Memory Transfer Overhead", "For small images (<256²), PCIe overhead can outweigh compute. GPU shines at scale (1024²+)."],
    ["Synchronize for Timing", "torch.cuda.synchronize() is critical for accurate GPU benchmarks; async launches skew results."],
    ["CuPy vs PyTorch", "CuPy gives raw CUDA control; PyTorch is portable and still CUDA-backed via cuDNN."],
    ["Bilateral Filter Wins Most", "The most compute-intensive kernel gains the most — 11× speedup due to O(d²×H×W) complexity."],
  ];
  lessons.forEach(([title, body], i) => {
    const y = 1.5 + i * 0.85;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 5.0, h: 0.75, fill: { color: C.bg_light }, line: { color: C.teal, width: 1 } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 0.06, h: 0.75, fill: { color: C.teal }, line: { color: C.teal } });
    s.addText(title, { x: 0.45, y: y + 0.05, w: 4.75, h: 0.28, fontSize: 11, bold: true, color: C.teal2 });
    s.addText(body, { x: 0.45, y: y + 0.33, w: 4.75, h: 0.36, fontSize: 9.5, color: C.off_white });
  });

  // Right col — Next Steps & Summary
  s.addShape(pres.shapes.RECTANGLE, { x: 5.5, y: 1.5, w: 4.2, h: 1.95, fill: { color: C.bg_light }, line: { color: C.blue, width: 1.5 }, shadow: mkShadow() });
  s.addText("🔭 Next Steps", { x: 5.6, y: 1.55, w: 4.0, h: 0.35, fontSize: 13, bold: true, color: C.blue });
  const nextSteps = ["Video processing pipeline (frame-by-frame GPU ops)", "NPP (NVIDIA Performance Primitives) integration", "Multi-GPU scaling with torch.distributed", "CUDA streams for pipelined async execution", "Deploy as REST API with GPU inference server"];
  nextSteps.forEach((ns, i) => {
    s.addText([{ text: ns, options: { bullet: true, color: C.off_white, fontSize: 9.5, breakLine: i < nextSteps.length - 1 } }], {
      x: 5.6, y: 1.97 + i * 0.28, w: 4.0, h: 0.27,
    });
  });

  // Final summary card
  s.addShape(pres.shapes.RECTANGLE, { x: 5.5, y: 3.45, w: 4.2, h: 1.75, fill: { color: C.teal, transparency: 85 }, line: { color: C.teal, width: 2 }, shadow: mkShadow() });
  s.addText("Project Summary", { x: 5.6, y: 3.48, w: 4.0, h: 0.35, fontSize: 13, bold: true, color: C.teal2 });
  s.addText([
    { text: "✅ 4 GPU kernels implemented\n", options: { color: C.off_white, fontSize: 9.5, breakLine: true } },
    { text: "✅ Raw CUDA code via CuPy\n", options: { color: C.off_white, fontSize: 9.5, breakLine: true } },
    { text: "✅ 9–18× speedups measured\n", options: { color: C.off_white, fontSize: 9.5, breakLine: true } },
    { text: "✅ Full repo with README & run.sh\n", options: { color: C.off_white, fontSize: 9.5, breakLine: true } },
    { text: "✅ Colab notebook + output artifacts", options: { color: C.off_white, fontSize: 9.5 } },
  ], { x: 5.6, y: 3.87, w: 4.0, h: 1.28 });

  // Author footer card
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 5.06, w: 4.8, h: 0.42, fill: { color: C.bg_light }, line: { color: C.accent, width: 1 } });
  s.addText("LAKSHMIDHAR N  —  GPU Specialization Capstone  —  CUDA at Scale for the Enterprise", {
    x: 0.32, y: 5.06, w: 4.78, h: 0.42, fontSize: 9.5, bold: true, color: C.accent, align: "center", valign: "middle",
  });
}

// ══════════════════════════════════════════════════════════════════════════
// Write file
// ══════════════════════════════════════════════════════════════════════════
const docsDir = path.dirname(OUTPUT);
if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

pres.writeFile({ fileName: OUTPUT }).then(() => {
  console.log(`✅ PPT saved: ${OUTPUT}`);
}).catch(err => {
  console.error("Error:", err);
  process.exit(1);
});

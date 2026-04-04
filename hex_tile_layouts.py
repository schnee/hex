#!/usr/bin/env python3
"""
hex_tile_layouts.py

Generate aesthetic layouts for 36 hexagonal acoustic tiles (12 red, 12 blue, 12 yellow)
with approximate aspect ratio control, organic tendrils, tight bounding box in inches,
and multiple color assignment strategies.

NEW (Color strategies)
----------------------
- --color-mode {random, gradient, scheme60}
- --gradient-order red,blue,yellow
- --gradient-axis {auto, x, y, principal}
- --dominant/--secondary/--accent for scheme60

Composite Output
----------------
- When --layouts > 1, outputs a single composite figure (landscape grid favored).
- If --save contains {i}, it's replaced with 'composite'.

Notes
-----
- Exactly 36 tiles are placed: 12 red, 12 blue, 12 yellow.
- Real tile: tip-to-tip = 12 in ⇒ circumradius R_real = 6 in (flat-to-flat ≈ 10.392 in ~ 10.4 in).
- Pointy-top hex spacing: horizontal center spacing = 1.5 * R, vertical = sqrt(3) * R.
"""
from __future__ import annotations

import argparse
import csv
import math
from dataclasses import dataclass
from typing import List, Optional, Sequence, Set, Tuple, Dict

import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import RegularPolygon

# -------------------------------
# Hex grid math (pointy-topped)
# -------------------------------
DIRECTIONS: List[Tuple[int, int]] = [
    (1, 0), (1, -1), (0, -1), (-1, 0), (-1, 1), (0, 1)
]

@dataclass(frozen=True)
class Hex:
    q: int
    r: int

    def neighbors(self) -> List["Hex"]:
        return [Hex(self.q + dq, self.r + dr) for (dq, dr) in DIRECTIONS]

# Axial -> pixel (pointy top). Radius is the hex circumradius in plot units
# x = R * (3/2 * q)
# y = R * (sqrt(3)/2 * q + sqrt(3) * r)

def axial_to_pixel(h: Hex, R: float) -> Tuple[float, float]:
    x = R * (1.5 * h.q)
    y = R * (math.sqrt(3)/2 * h.q + math.sqrt(3) * h.r)
    return x, y

# -------------------------------
# Layout generation
# -------------------------------
@dataclass
class LayoutParams:
    total_tiles: int = 36
    colors: Tuple[str, str, str] = ("red", "blue", "yellow")
    counts: Tuple[int, int, int] = (12, 12, 12)
    radius: float = 1.0  # plot radius (circumradius)
    aspect_w: float = 4.0
    aspect_h: float = 3.0
    tendrils: int = 3
    tendril_len_min: int = 2
    tendril_len_max: int = 4
    tendril_direction_variability: float = 0.25
    aspect_bias: float = 0.70
    compactness_bias: float = 0.30

    # Color strategy params
    color_mode: str = "random"  # random | gradient | scheme60
    gradient_order: Tuple[str, str, str] = ("red", "blue", "yellow")
    gradient_axis: str = "auto"  # auto|x|y|principal
    dominant: str = "red"
    secondary: str = "blue"
    accent: str = "yellow"

    def aspect(self) -> float:
        return max(1e-6, self.aspect_w / self.aspect_h)

# Utility: compute pixel-space bounding box of a set of hex centers

def bounds_px(hexes: Set[Hex], R: float) -> Tuple[float, float, float, float]:
    xs, ys = zip(*(axial_to_pixel(h, R) for h in hexes)) if hexes else ([0], [0])
    return min(xs), min(ys), max(xs), max(ys)

# Heuristic score balancing aspect and compactness

def candidate_score(hexes: Set[Hex], candidate: Hex, params: LayoutParams) -> float:
    new_set = set(hexes)
    new_set.add(candidate)
    x0, y0, x1, y1 = bounds_px(new_set, params.radius)
    width = max(1e-6, x1 - x0 + params.radius)
    height = max(1e-6, y1 - y0 + params.radius)

    target = params.aspect()
    ratio = width / height
    aspect_term = 1.0 / (1.0 + abs(math.log(ratio / target)))

    area = width * height
    compact_term = 1.0 / (1.0 + area / (params.radius * params.radius * params.total_tiles * 5.0))

    return params.aspect_bias * aspect_term + params.compactness_bias * compact_term

# Grow a connected organic blob of size n using frontier-based selection

def grow_blob(n: int, rng: np.random.Generator, params: LayoutParams) -> Set[Hex]:
    S: Set[Hex] = {Hex(0, 0)}
    frontier: Set[Hex] = set(S.pop().neighbors())
    S.add(Hex(0, 0))

    while len(S) < n and frontier:
        candidates = list(frontier)
        scores = np.array([candidate_score(S, c, params) for c in candidates], dtype=float)
        if np.all(scores == 0):
            probs = np.ones_like(scores) / len(scores)
        else:
            scores = scores - scores.max()
            probs = np.exp(scores)
            probs /= probs.sum()
        choice_idx = int(rng.choice(len(candidates), p=probs))
        chosen = candidates[choice_idx]
        S.add(chosen)
        frontier.remove(chosen)
        for nb in chosen.neighbors():
            if nb not in S:
                frontier.add(nb)

    while len(S) < n:
        ring: List[Hex] = []
        for h in list(S):
            for nb in h.neighbors():
                if nb not in S and nb not in ring:
                    ring.append(nb)
        if not ring:
            break
        S.add(ring[int(rng.integers(0, len(ring)))])
    return S

# Perimeter open directions

def perimeter_with_open_dirs(S: Set[Hex]) -> List[Tuple[Hex, List[Tuple[int, int]]]]:
    out: List[Tuple[Hex, List[Tuple[int, int]]]] = []
    for h in S:
        open_dirs = []
        for d in DIRECTIONS:
            nb = Hex(h.q + d[0], h.r + d[1])
            if nb not in S:
                open_dirs.append(d)
        if open_dirs:
            out.append((h, open_dirs))
    return out

# Tendril growth

def add_tendrils(S: Set[Hex], total_target: int, rng: np.random.Generator, params: LayoutParams) -> Set[Hex]:
    if len(S) >= total_target or params.tendrils <= 0:
        return S

    perim = perimeter_with_open_dirs(S)
    if not perim:
        return S

    tendril_specs: List[int] = [int(rng.integers(params.tendril_len_min, params.tendril_len_max + 1))
                                for _ in range(params.tendrils)]

    for L in tendril_specs:
        if len(S) >= total_target:
            break
        start, dirs = perim[int(rng.integers(0, len(perim)))]
        direction = dirs[int(rng.integers(0, len(dirs)))]
        current = Hex(start.q + direction[0], start.r + direction[1])
        steps = 0
        while steps < L and len(S) < total_target:
            if current in S:
                break
            S.add(current)
            steps += 1
            if rng.random() < params.tendril_direction_variability:
                idx = DIRECTIONS.index(direction)
                turn = int(rng.choice([-1, 1]))
                direction = DIRECTIONS[(idx + turn) % 6]
            current = Hex(current.q + direction[0], current.r + direction[1])
            if current in S:
                back = Hex(current.q - direction[0], current.r - direction[1])
                alt_dirs = [d for d in DIRECTIONS if Hex(back.q + d[0], back.r + d[1]) not in S]
                if alt_dirs:
                    direction = alt_dirs[int(rng.integers(0, len(alt_dirs)))]
                    current = Hex(back.q + direction[0], back.r + direction[1])
        perim = perimeter_with_open_dirs(S)
        if not perim:
            break

    while len(S) < total_target:
        perim = perimeter_with_open_dirs(S)
        if not perim:
            break
        start, dirs = perim[int(rng.integers(0, len(perim)))]
        d = dirs[int(rng.integers(0, len(dirs)))]
        S.add(Hex(start.q + d[0], start.r + d[1]))
    return S

# -------------------------------
# Color assignment strategies
# -------------------------------
ALL_COLORS = {"red", "blue", "yellow"}

def _validate_color_name(name: str) -> str:
    if name not in ALL_COLORS:
        raise ValueError(f"Unknown color '{name}'. Allowed: {sorted(ALL_COLORS)}")
    return name


def assign_colors_random(n: int, rng: np.random.Generator, params: LayoutParams) -> List[str]:
    palette: List[str] = []
    for color, count in zip(params.colors, params.counts):
        palette.extend([color] * count)
    assert len(palette) == n
    rng.shuffle(palette)
    return palette


def _principal_axis(xs: np.ndarray, ys: np.ndarray) -> Tuple[float, float]:
    X = np.vstack([xs - xs.mean(), ys - ys.mean()])
    C = X @ X.T / max(1, X.shape[1] - 1)
    eigvals, eigvecs = np.linalg.eig(C)
    idx = int(np.argmax(eigvals))
    v = eigvecs[:, idx]
    vx, vy = float(v[0]), float(v[1])
    norm = math.hypot(vx, vy) or 1.0
    return vx / norm, vy / norm


def assign_colors_gradient(hexes: List[Hex], rng: np.random.Generator, params: LayoutParams) -> List[str]:
    xs, ys = zip(*(axial_to_pixel(h, params.radius) for h in hexes))
    xs = np.array(xs, dtype=float)
    ys = np.array(ys, dtype=float)

    axis = params.gradient_axis.lower()
    if axis in ("auto", "principal"):
        vx, vy = _principal_axis(xs, ys)
    elif axis == "x":
        vx, vy = 1.0, 0.0
    elif axis == "y":
        vx, vy = 0.0, 1.0
    else:
        vx, vy = _principal_axis(xs, ys)

    s = xs * vx + ys * vy
    s = s + rng.normal(0.0, 0.02 * params.radius, size=len(s))  # jitter

    order = list(params.gradient_order)
    for c in order:
        _validate_color_name(c)

    idxs = np.argsort(s)
    bands = np.array_split(idxs, 3)
    color_for_idx: Dict[int, str] = {}
    for band, color in zip(bands, order):
        for i in band:
            color_for_idx[int(i)] = color

    counts: Dict[str, int] = {c: 0 for c in ALL_COLORS}
    for i in range(len(hexes)):
        counts[color_for_idx[i]] += 1
    target = {c: 12 for c in ALL_COLORS}
    if counts != target:
        sorted_idxs = list(map(int, idxs))
        for c in ALL_COLORS:
            while counts[c] > target[c]:
                src_i = next(i for i in reversed(sorted_idxs) if color_for_idx[i] == c)
                deficit_colors = [d for d in ALL_COLORS if counts[d] < target[d]]
                if not deficit_colors:
                    break
                d = deficit_colors[0]
                color_for_idx[src_i] = d
                counts[c] -= 1
                counts[d] += 1
                if counts == target:
                    break

    colors = [color_for_idx[i] for i in range(len(hexes))]
    return colors


def assign_colors_scheme60(hexes: List[Hex], rng: np.random.Generator, params: LayoutParams) -> List[str]:
    xs, ys = zip(*(axial_to_pixel(h, params.radius) for h in hexes))
    xs = np.array(xs, dtype=float)
    ys = np.array(ys, dtype=float)
    cx, cy = float(xs.mean()), float(ys.mean())
    d = np.hypot(xs - cx, ys - cy)

    order = [params.dominant, params.secondary, params.accent]
    for c in order:
        _validate_color_name(c)

    z1 = int(round(0.60 * len(hexes)))
    z2 = int(round(0.30 * len(hexes)))
    z3 = max(0, len(hexes) - z1 - z2)

    sorted_idxs = list(map(int, np.argsort(d)))
    zones = [sorted_idxs[:z1], sorted_idxs[z1:z1+z2], sorted_idxs[z1+z2:]]

    remaining = {c: 12 for c in ALL_COLORS}
    color_for_idx: Dict[int, str] = {}

    def fill_zone(indices: List[int], preferred: str, secondary: List[str]):
        rng.shuffle(indices)
        for i in indices:
            if remaining[preferred] > 0:
                color_for_idx[i] = preferred
                remaining[preferred] -= 1
            else:
                for alt in secondary:
                    if remaining[alt] > 0:
                        color_for_idx[i] = alt
                        remaining[alt] -= 1
                        break

    fill_zone(zones[0], preferred=order[0], secondary=[order[1], order[2]])
    fill_zone(zones[1], preferred=order[1], secondary=[order[0], order[2]])
    fill_zone(zones[2], preferred=order[2], secondary=[order[1], order[0]])

    for i in range(len(hexes)):
        if i not in color_for_idx:
            avail = [c for c, k in remaining.items() if k > 0]
            if avail:
                c = avail[0]
                color_for_idx[i] = c
                remaining[c] -= 1

    colors = [color_for_idx[i] for i in range(len(hexes))]
    assert sum(1 for c in colors if c == order[0]) <= 12
    assert sum(1 for c in colors if c == order[1]) <= 12
    assert sum(1 for c in colors if c == order[2]) <= 12
    assert len(colors) == 36
    return colors

# -------------------------------
# Tight bounding box around tiles (pointy-top hex)
# -------------------------------

def full_tile_bbox(hexes: List[Hex], params: LayoutParams) -> Tuple[float, float, float, float]:
    xs, ys = zip(*(axial_to_pixel(h, params.radius) for h in hexes))
    dx = (math.sqrt(3) / 2.0) * params.radius
    dy = 1.0 * params.radius
    min_x = min(xs) - dx
    max_x = max(xs) + dx
    min_y = min(ys) - dy
    max_y = max(ys) + dy
    return min_x, min_y, max_x, max_y

# -------------------------------
# Plotting helpers
# -------------------------------

def plot_layout_on_ax(ax: plt.Axes, hexes: List[Hex], colors: List[str], params: LayoutParams, title: str = "") -> None:
    # Draw tiles
    for (h, c) in sorted(zip(hexes, colors), key=lambda t: (t[0].q, t[0].r)):
        x, y = axial_to_pixel(h, params.radius)
        patch = RegularPolygon((x, y), numVertices=6, radius=params.radius, orientation=math.radians(30),
                               edgecolor='black', facecolor=c, linewidth=1.0)
        ax.add_patch(patch)

    # Tight bounding box (in plot units)
    min_x, min_y, max_x, max_y = full_tile_bbox(hexes, params)

    # Convert to inches (R_real = 6 in)
    real_R_in = 6.0
    scale = real_R_in / params.radius
    width_in = (max_x - min_x) * scale
    height_in = (max_y - min_y) * scale

    # Draw bounding box and annotate
    rect = plt.Rectangle((min_x, min_y), max_x - min_x, max_y - min_y,
                         fill=False, edgecolor='green', linewidth=2, linestyle='--')
    ax.add_patch(rect)

    label_y = max_y + 0.35 * params.radius
    ax.text(min_x, label_y,
            f"Bounding Box: {width_in:.1f} in × {height_in:.1f} in",
            fontsize=12, color='green', va='bottom')

    pad = 0.75 * params.radius
    ax.set_xlim(min_x - pad, max_x + pad)
    ax.set_ylim(min_y - pad, label_y + pad)
    ax.set_aspect('equal')
    ax.axis('off')
    ax.set_title(title or "Hexagonal Tile Layout")

    # Console output
    print(f"{(title or 'Layout')} | Bounding Box: {width_in:.1f} in x {height_in:.1f} in")


def plot_layout(hexes: List[Hex], colors: List[str], params: LayoutParams, title: str = "") -> plt.Figure:
    fig, ax = plt.subplots(figsize=(10, 8))
    plot_layout_on_ax(ax, hexes, colors, params, title)
    return fig

# -------------------------------
# CSV export
# -------------------------------

def export_csv(path: str, hexes: List[Hex], colors: List[str], params: LayoutParams) -> None:
    with open(path, 'w', newline='') as f:
        w = csv.writer(f)
        w.writerow(["q", "r", "x", "y", "color"])
        for h, c in zip(hexes, colors):
            x, y = axial_to_pixel(h, params.radius)
            w.writerow([h.q, h.r, f"{x:.6f}", f"{y:.6f}", c])

# -------------------------------
# Generate one layout
# -------------------------------

def generate_layout(rng: np.random.Generator, params: LayoutParams) -> Tuple[List[Hex], List[str]]:
    base_n = max(1, int(round(params.total_tiles * (1.0 - min(0.8, 0.12 * params.tendrils)))))
    base_blob = grow_blob(base_n, rng, params)
    full = add_tendrils(set(base_blob), params.total_tiles, rng, params)
    if len(full) > params.total_tiles:
        full = set(list(full)[: params.total_tiles])
    assert len(full) == params.total_tiles
    hexes = list(full)

    if params.color_mode == 'random':
        colors = assign_colors_random(len(hexes), rng, params)
    elif params.color_mode == 'gradient':
        colors = assign_colors_gradient(hexes, rng, params)
    elif params.color_mode in ('scheme60', '60-30-10', 'scheme_60_30_10'):
        colors = assign_colors_scheme60(hexes, rng, params)
    else:
        raise ValueError("Unknown --color-mode. Use: random | gradient | scheme60")

    return hexes, colors

# -------------------------------
# CLI
# -------------------------------

def parse_aspect(s: str) -> Tuple[float, float]:
    if ':' in s:
        a, b = s.split(':', 1)
    elif 'x' in s.lower():
        a, b = s.lower().split('x', 1)
    else:
        raise argparse.ArgumentTypeError("Aspect must be in W:H or WxH format, e.g., 4:3 or 16x9")
    try:
        w = float(a)
        h = float(b)
        if w <= 0 or h <= 0:
            raise ValueError
        return w, h
    except Exception:
        raise argparse.ArgumentTypeError("Invalid aspect numbers. Use positive numbers like 4:3 or 2.5:1")

def parse_len_range(s: str) -> Tuple[int, int]:
    if ',' in s:
        a, b = s.split(',', 1)
    elif ':' in s:
        a, b = s.split(':', 1)
    else:
        try:
            v = int(s)
            return v, v
        except Exception:
            raise argparse.ArgumentTypeError("Use MIN,MAX or MIN:MAX for tendril length (e.g., 2,4)")
    try:
        lo = int(a)
        hi = int(b)
        if lo <= 0 or hi <= 0 or hi < lo:
            raise ValueError
        return lo, hi
    except Exception:
        raise argparse.ArgumentTypeError("Invalid tendril length range. Use positive integers like 2,4")

ALL_COLORS = {"red", "blue", "yellow"}

def parse_color_list(s: str) -> Tuple[str, str, str]:
    parts = [p.strip() for p in s.split(',') if p.strip()]
    if len(parts) != 3:
        raise argparse.ArgumentTypeError("--gradient-order must be 'c1,c2,c3' with three colors")
    parts = tuple(parts)
    for p in parts:
        if p not in ALL_COLORS:
            raise argparse.ArgumentTypeError(f"Unknown color '{p}'. Allowed: {sorted(ALL_COLORS)}")
    if set(parts) != ALL_COLORS:
        raise argparse.ArgumentTypeError(f"--gradient-order must include each of {sorted(ALL_COLORS)} exactly once")
    return parts  # type: ignore


def main(argv: Optional[Sequence[str]] = None) -> None:
    p = argparse.ArgumentParser(description="Generate hexagonal tile layouts with tendrils, color strategies, and composite output.")
    p.add_argument("--aspect", default="4:3", type=parse_aspect, help="Target aspect ratio W:H (default 4:3)")
    p.add_argument("--layouts", type=int, default=3, help="Number of layouts to generate (default 3)")
    p.add_argument("--seed", type=int, default=None, help="Random seed for reproducibility")
    p.add_argument("--radius", type=float, default=1.0, help="Hex radius in plot units (default 1.0)")
    p.add_argument("--tendrils", type=int, default=3, help="Number of tendrils to grow (default 3)")
    p.add_argument("--tendril-len", dest="tendril_len", default="2,4", type=parse_len_range,
                   help="Tendril length as MIN,MAX (default 2,4)")
    p.add_argument("--show", action="store_true", help="Display interactively using matplotlib")
    p.add_argument("--save", type=str, default=None,
                   help="Save composite (or single) figure; '{i}' replaced with 'composite' when layouts>1")
    p.add_argument("--export-csv", dest="export_csv", type=str, default=None,
                   help="Export each layout's coords/colors to CSV, e.g., 'layout_{i}.csv'")
    p.add_argument("--title", type=str, default=None, help="Title prefix for plots")

    # Color strategy args
    p.add_argument("--color-mode", type=str, default="random",
                   choices=["random", "gradient", "scheme60"],
                   help="Color assignment: random (default), gradient, scheme60 (60-30-10)")
    p.add_argument("--gradient-order", type=parse_color_list, default="red,blue,yellow",
                   help="Order for gradient (low→high along axis), e.g., red,yellow,blue")
    p.add_argument("--gradient-axis", type=str, default="auto",
                   choices=["auto", "x", "y", "principal"],
                   help="Axis for gradient: auto/principal, x, or y (default auto)")
    p.add_argument("--dominant", type=str, default="red", help="Dominant color for scheme60")
    p.add_argument("--secondary", type=str, default="blue", help="Secondary color for scheme60")
    p.add_argument("--accent", type=str, default="yellow", help="Accent color for scheme60")

    args = p.parse_args(argv)

    (aspect_w, aspect_h) = args.aspect
    (len_min, len_max) = args.tendril_len

    for nm in (args.dominant, args.secondary, args.accent):
        if nm not in ALL_COLORS:
            raise SystemExit(f"Invalid color '{nm}' for scheme60. Allowed: {sorted(ALL_COLORS)}")
    if len({args.dominant, args.secondary, args.accent}) != 3:
        raise SystemExit("--dominant/--secondary/--accent must be three distinct colors (red, blue, yellow)")

    params = LayoutParams(
        total_tiles=36,
        colors=("red", "blue", "yellow"),
        counts=(12, 12, 12),
        radius=args.radius,
        aspect_w=aspect_w,
        aspect_h=aspect_h,
        tendrils=max(0, int(args.tendrils)),
        tendril_len_min=len_min,
        tendril_len_max=len_max,
        color_mode=args.color_mode,
        gradient_order=args.gradient_order if isinstance(args.gradient_order, tuple) else tuple(args.gradient_order.split(',')),
        gradient_axis=args.gradient_axis,
        dominant=args.dominant,
        secondary=args.secondary,
        accent=args.accent,
    )

    base_seed = args.seed if args.seed is not None else int(np.random.SeedSequence().entropy)

    # Composite handling
    figs: List[plt.Figure] = []
    if int(args.layouts) <= 1:
        rng = np.random.default_rng(int(base_seed))
        hexes, colors = generate_layout(rng, params)
        title = (args.title or "Hexagonal Tile Layout") + f"  (#1, seed={int(base_seed)}, mode={params.color_mode})"
        fig = plot_layout(hexes, colors, params, title)
        figs.append(fig)
        if args.save:
            out_path = args.save.replace('{i}', 'composite') if '{i}' in args.save else args.save
            fig.savefig(out_path, dpi=200, bbox_inches='tight')
            print(f"Saved: {out_path}")
    else:
        N = int(args.layouts)
        # Favor landscape: cols >= rows
        cols = int(math.ceil(math.sqrt(N)))
        rows = int(math.ceil(N / cols))
        if cols < rows:
            cols, rows = rows, cols
        fig, axes = plt.subplots(rows, cols, figsize=(cols * 6, rows * 6))
        axes_list = axes if isinstance(axes, np.ndarray) else np.array([[axes]])
        axes_flat = axes_list.flatten()
        for i in range(N):
            rng = np.random.default_rng(int(base_seed) + i)
            hexes, colors = generate_layout(rng, params)
            ax = axes_flat[i]
            title = (args.title or "Hexagonal Tile Layout") + f"  (#{i+1}, seed={int(base_seed)+i}, mode={params.color_mode})"
            plot_layout_on_ax(ax, hexes, colors, params, title)
            if args.export_csv:
                csv_path = args.export_csv.replace('{i}', str(i+1)) if '{i}' in args.export_csv else args.export_csv
                export_csv(csv_path, hexes, colors, params)
                print(f"Exported CSV: {csv_path}")
        for j in range(N, rows*cols):
            axes_flat[j].axis('off')
        fig.suptitle((args.title or 'Hexagonal Tile Layouts') + f" — {N} layouts, seed={int(base_seed)}, mode={params.color_mode}", fontsize=14)
        if args.save:
            out_path = args.save.replace('{i}', 'composite') if '{i}' in args.save else args.save
            fig.savefig(out_path, dpi=220, bbox_inches='tight')
            print(f"Saved composite: {out_path}")
        figs.append(fig)

    if args.show:
        plt.show()
    else:
        for f in figs:
            plt.close(f)


if __name__ == "__main__":
    main()

# app/hex_tile_layouts_core.py
from __future__ import annotations

import math
from dataclasses import dataclass
from typing import List, Tuple, Dict, Set

import io
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import RegularPolygon
from PIL import Image

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

def axial_to_pixel(h: Hex, R: float) -> Tuple[float, float]:
    # pointy-top axial
    x = R * (1.5 * h.q)
    y = R * (math.sqrt(3)/2 * h.q + math.sqrt(3) * h.r)
    return x, y

# -------------------------------
# Params (v2 semantics; N colors)
# -------------------------------
@dataclass
class LayoutParams:
    total_tiles: int
    radius: float = 1.0
    aspect_w: float = 4.0
    aspect_h: float = 3.0

    tendrils: int = 3
    tendril_len_min: int = 2
    tendril_len_max: int = 4
    tendril_direction_variability: float = 0.25

    # Aspect control (v2)
    aspect_adherence: float = 0.7     # 0..1 (loose..strict)
    compactness_bias: float = 0.35    # 0..1 (relative weight in scoring)

    # Color strategy params (v2)
    color_mode: str = "random"        # random | gradient | scheme60
    colors: List[str] = None          # hex strings (N colors)
    counts: List[int] = None          # quotas per color, sum to total_tiles
    gradient_order: List[int] = None  # permutation of [0..N-1]
    gradient_axis: str = "auto"       # auto|x|y|principal
    roles: Dict[str, int] = None      # {'dominant': i, 'secondary': i, 'accent': i} (indices)

    def aspect(self) -> float:
        return max(1e-6, self.aspect_w / self.aspect_h)

# -------------------------------
# Bounding / aspect helpers
# -------------------------------
def bounds_px(hexes: Set[Hex], R: float) -> Tuple[float, float, float, float]:
    xs, ys = zip(*(axial_to_pixel(h, R) for h in hexes)) if hexes else ([0], [0])
    return min(xs), min(ys), max(xs), max(ys)

def full_tile_bbox(hexes: List[Hex], params: LayoutParams) -> Tuple[float, float, float, float]:
    xs, ys = zip(*(axial_to_pixel(h, params.radius) for h in hexes))
    dx = (math.sqrt(3) / 2.0) * params.radius
    dy = 1.0 * params.radius
    return min(xs)-dx, min(ys)-dy, max(xs)+dx, max(ys)+dy

def aspect_ratio_from_hexes(hexes: Set[Hex], params: LayoutParams) -> float:
    if not hexes:
        return 1.0
    x0, y0, x1, y1 = bounds_px(hexes, params.radius)
    dx = (math.sqrt(3) / 2.0) * params.radius
    dy = 1.0 * params.radius
    w = (x1 - x0) + 2*dx
    h = (y1 - y0) + 2*dy
    return max(1e-6, w / h)

def aspect_error(ratio: float, target: float) -> float:
    return abs(math.log(max(1e-9, ratio/target)))

# -------------------------------
# Scoring & growth (v2-ish)
# -------------------------------
def candidate_score(hexes: Set[Hex], candidate: Hex, params: LayoutParams) -> float:
    new_set = set(hexes); new_set.add(candidate)

    # Aspect adherence
    r = aspect_ratio_from_hexes(new_set, params)
    err = aspect_error(r, params.aspect())
    k = 4.0 + 18.0 * params.aspect_adherence  # penalty steepness
    aspect_term = math.exp(-k * err * err)

    # Compactness
    x0, y0, x1, y1 = bounds_px(new_set, params.radius)
    dx = (math.sqrt(3) / 2.0) * params.radius
    dy = 1.0 * params.radius
    width = (x1 - x0) + 2*dx
    height = (y1 - y0) + 2*dy
    area = width * height
    compact_term = 1.0 / (1.0 + area / (params.radius * params.radius * max(1, params.total_tiles)))

    # Blend
    w_aspect = 0.65 + 0.30 * params.aspect_adherence
    w_compact = params.compactness_bias * (1.0 - w_aspect)
    return 1e-6 + (w_aspect * aspect_term + w_compact * compact_term)

def grow_blob(n: int, rng: np.random.Generator, params: LayoutParams) -> Set[Hex]:
    S: Set[Hex] = {Hex(0, 0)}
    frontier: Set[Hex] = set(S.pop().neighbors()); S.add(Hex(0, 0))

    tol_log = (0.40 - 0.33 * params.aspect_adherence)  # loose..strict

    while len(S) < n and frontier:
        candidates = list(frontier)
        scores = np.array([candidate_score(S, c, params) for c in candidates], float)

        # Downweight candidates that exceed aspect tolerance
        if len(S) > 3:
            errs = [aspect_error(aspect_ratio_from_hexes(S | {c}, params), params.aspect()) for c in candidates]
            mask = np.array([1.0 if e <= tol_log else 0.10 for e in errs])
            scores = scores * mask

        if np.all(scores == 0):
            probs = np.ones_like(scores) / len(scores)
        else:
            scores = scores - scores.max()
            probs = np.exp(scores); probs /= probs.sum()

        chosen = candidates[int(rng.choice(len(candidates), p=probs))]
        S.add(chosen); frontier.remove(chosen)
        for nb in chosen.neighbors():
            if nb not in S:
                frontier.add(nb)

    # fill if undershoot
    while len(S) < n:
        ring: List[Hex] = []
        for h in list(S):
            for nb in h.neighbors():
                if nb not in S and nb not in ring:
                    ring.append(nb)
        if not ring:
            break
        best, best_sc = None, -1.0
        for c in ring:
            sc = candidate_score(S, c, params)
            if sc > best_sc:
                best, best_sc = c, sc
        if best is None: break
        S.add(best)

    return S

def perimeter_with_open_dirs(S: Set[Hex]) -> List[Tuple[Hex, List[Tuple[int, int]]]]:
    out: List[Tuple[Hex, List[Tuple[int, int]]]] = []
    for h in S:
        opens = []
        for d in DIRECTIONS:
            nb = Hex(h.q + d[0], h.r + d[1])
            if nb not in S:
                opens.append(d)
        if opens:
            out.append((h, opens))
    return out

def add_tendrils(S: Set[Hex], total_target: int, rng: np.random.Generator, params: LayoutParams) -> Set[Hex]:
    if len(S) >= total_target or params.tendrils <= 0: return S
    perim = perimeter_with_open_dirs(S)
    if not perim: return S

    tol_log = (0.45 - 0.35 * params.aspect_adherence)

    lengths = [int(rng.integers(params.tendril_len_min, params.tendril_len_max + 1))
               for _ in range(params.tendrils)]
    for L in lengths:
        if len(S) >= total_target or not perim: break
        start, dirs = perim[int(rng.integers(0, len(perim)))]
        direction = dirs[int(rng.integers(0, len(dirs)))]
        current = Hex(start.q + direction[0], start.r + direction[1])
        steps = 0
        while steps < L and len(S) < total_target:
            e = aspect_error(aspect_ratio_from_hexes(S | {current}, params), params.aspect())
            if e > tol_log:
                back = Hex(current.q - direction[0], current.r - direction[1])
                alt_dirs = [d for d in DIRECTIONS if Hex(back.q + d[0], back.r + d[1]) not in S]
                if not alt_dirs: break
                best_dir, best_err = None, float('inf')
                for d in alt_dirs:
                    cand = Hex(back.q + d[0], back.r + d[1])
                    ee = aspect_error(aspect_ratio_from_hexes(S | {cand}, params), params.aspect())
                    if ee < best_err:
                        best_err, best_dir = ee, d
                if best_dir is None or best_err > tol_log: break
                direction = best_dir
                current = Hex(back.q + direction[0], back.r + direction[1])

            if current in S: break
            S.add(current); steps += 1
            if rng.random() < params.tendril_direction_variability:
                idx = DIRECTIONS.index(direction)
                turn = int(rng.choice([-1, 1]))
                direction = DIRECTIONS[(idx + turn) % 6]
            current = Hex(current.q + direction[0], current.r + direction[1])
        perim = perimeter_with_open_dirs(S)

    while len(S) < total_target:
        perim = perimeter_with_open_dirs(S)
        if not perim: break
        best, best_sc = None, -1.0
        for (start, dirs) in perim:
            for d in dirs:
                cand = Hex(start.q + d[0], start.r + d[1])
                sc = candidate_score(S, cand, params)
                if sc > best_sc and cand not in S:
                    best, best_sc = cand, sc
        if best is None: break
        S.add(best)
    return S

# -------------------------------
# Color strategies (N-color, v2)
# -------------------------------
def assign_colors_random(hexes: List[Hex], rng: np.random.Generator,
                         colors: List[str], counts: List[int]) -> List[str]:
    pal: List[str] = []
    for c, k in zip(colors, counts):
        pal.extend([c] * int(k))
    rng.shuffle(pal)
    return pal[:len(hexes)]

def principal_axis(xs: np.ndarray, ys: np.ndarray) -> Tuple[float, float]:
    X = np.vstack([xs - xs.mean(), ys - ys.mean()])
    C = X @ X.T / max(1, X.shape[1] - 1)
    vals, vecs = np.linalg.eig(C)
    v = vecs[:, int(np.argmax(vals))]
    vx, vy = float(v[0]), float(v[1]); n = math.hypot(vx, vy) or 1.0
    return vx/n, vy/n

def assign_colors_gradient(hexes: List[Hex], rng: np.random.Generator, params: LayoutParams) -> List[str]:
    xs, ys = zip(*(axial_to_pixel(h, params.radius) for h in hexes))
    xs = np.array(xs, float); ys = np.array(ys, float)
    ax = params.gradient_axis.lower()
    if ax in ("auto","principal"): vx, vy = principal_axis(xs, ys)
    elif ax == "x": vx, vy = 1.0, 0.0
    elif ax == "y": vx, vy = 0.0, 1.0
    else: vx, vy = principal_axis(xs, ys)

    s = xs*vx + ys*vy
    s = s + rng.normal(0.0, 0.02*params.radius, size=len(s))
    idxs = np.argsort(s)

    order = list(params.gradient_order or list(range(len(params.colors))))
    counts_ordered = [int(params.counts[i]) for i in order]
    colors_ordered = [params.colors[i] for i in order]

    colors = [None] * len(hexes)
    pos = 0
    for col, q in zip(colors_ordered, counts_ordered):
        for i in map(int, idxs[pos:pos+q]):
            colors[i] = col
        pos += q
    # fill any None due to rounding
    for i in range(len(colors)):
        if colors[i] is None:
            colors[i] = colors_ordered[-1]
    return colors  # type: ignore

def assign_colors_scheme60(hexes: List[Hex], rng: np.random.Generator, params: LayoutParams) -> List[str]:
    N = len(hexes)
    xs, ys = zip(*(axial_to_pixel(h, params.radius) for h in hexes))
    xs = np.array(xs, float); ys = np.array(ys, float)
    cx, cy = float(xs.mean()), float(ys.mean())
    d = np.hypot(xs - cx, ys - cy)

    z1 = int(round(0.60 * N)); z2 = int(round(0.30 * N))
    sorted_idxs = list(map(int, np.argsort(d)))
    zones = [sorted_idxs[:z1], sorted_idxs[z1:z1+z2], sorted_idxs[z1+z2:]]

    # Choose roles; default to largest counts = dominant
    if params.roles is None:
        order_idx = list(np.argsort([-c for c in params.counts]))
        roles = {
            'dominant':  order_idx[0] if len(order_idx) > 0 else 0,
            'secondary': order_idx[1] if len(order_idx) > 1 else 0,
            'accent':    order_idx[2] if len(order_idx) > 2 else 0,
        }
    else:
        roles = params.roles

    remaining = {i: int(params.counts[i]) for i in range(len(params.colors))}
    color_for_idx: Dict[int, str] = {}

    def fill_zone(indices: List[int], pref: int, fallbacks: List[int]):
        rng.shuffle(indices)
        for i in indices:
            pick = None
            if remaining.get(pref, 0) > 0:
                pick = pref
            else:
                for fb in fallbacks:
                    if remaining.get(fb, 0) > 0:
                        pick = fb; break
            if pick is None:
                # final fallback to any available
                avail = [fi for fi, k in remaining.items() if k > 0]
                pick = (avail[0] if avail else pref)
            color_for_idx[i] = params.colors[pick]
            remaining[pick] = max(0, remaining.get(pick, 0) - 1)

    idx_all = list(range(len(params.colors)))
    dom, sec, acc = roles['dominant'], roles['secondary'], roles['accent']
    fill_zone(zones[0], dom, [i for i in idx_all if i != dom])
    fill_zone(zones[1], sec, [i for i in idx_all if i != sec])
    fill_zone(zones[2], acc, [i for i in idx_all if i != acc])

    # fill any holes
    for i in range(N):
        if i not in color_for_idx:
            avail = [fi for fi, k in remaining.items() if k > 0]
            pick = (avail[0] if avail else dom)
            color_for_idx[i] = params.colors[pick]
            remaining[pick] = max(0, remaining.get(pick, 0) - 1)

    return [color_for_idx[i] for i in range(N)]

# -------------------------------
# Rendering helpers
# -------------------------------
def plot_layout_on_ax(ax, hexes: List[Hex], colors_assigned: List[str],
                      params: LayoutParams, title: str = "") -> Tuple[float, float]:
    for (h, c) in sorted(zip(hexes, colors_assigned), key=lambda t: (t[0].q, t[0].r)):
        x, y = axial_to_pixel(h, params.radius)
        ax.add_patch(
            RegularPolygon((x, y), numVertices=6, radius=params.radius,
                           orientation=math.radians(30),
                           edgecolor='black', facecolor=c, linewidth=1.0)
        )
    min_x, min_y, max_x, max_y = full_tile_bbox(hexes, params)
    real_R_in = 6.0
    scale = real_R_in / params.radius
    w_in = (max_x - min_x) * scale
    h_in = (max_y - min_y) * scale

    ax.add_patch(plt.Rectangle((min_x, min_y), max_x-min_x, max_y-min_y,
                               fill=False, edgecolor='green', linewidth=2, linestyle='--'))
    label_y = max_y + 0.35 * params.radius
    ax.text(min_x, label_y, f"Bounding Box: {w_in:.1f} in × {h_in:.1f} in",
            fontsize=10, color='green', va='bottom')
    pad = 0.75 * params.radius
    ax.set_xlim(min_x - pad, max_x + pad); ax.set_ylim(min_y - pad, label_y + pad)
    ax.set_aspect('equal'); ax.axis('off'); ax.set_title(title)
    return w_in, h_in

def transparent_png_bytes(hexes: List[Hex], colors_assigned: List[str],
                          params: LayoutParams, dpi: int = 220) -> bytes:
    fig, ax = plt.subplots(figsize=(6,5), dpi=dpi)
    for (h, c) in sorted(zip(hexes, colors_assigned), key=lambda t: (t[0].q, t[0].r)):
        x, y = axial_to_pixel(h, params.radius)
        ax.add_patch(RegularPolygon((x, y), numVertices=6, radius=params.radius,
                                    orientation=math.radians(30),
                                    edgecolor='none', facecolor=c, linewidth=1.0))
    min_x, min_y, max_x, max_y = full_tile_bbox(hexes, params)
    pad = 0.5 * params.radius
    ax.set_xlim(min_x - pad, max_x + pad); ax.set_ylim(min_y - pad, max_y + pad)
    ax.set_aspect('equal'); ax.axis('off')
    buf = io.BytesIO()
    fig.savefig(buf, format='png', transparent=True, bbox_inches='tight', pad_inches=0)
    plt.close(fig); buf.seek(0)
    return buf.getvalue()

# -------------------------------
# Driver – one layout (positions + colors)
# -------------------------------
def generate_layout(rng: np.random.Generator, params: LayoutParams) -> Tuple[List[Hex], List[str]]:
    # Higher adherence -> more of the shape comes from the base blob (tendrils distort aspect)
    base_fraction = 0.75 + 0.20 * params.aspect_adherence
    base_n = max(1, int(round(params.total_tiles * base_fraction)))
    base_blob = grow_blob(base_n, rng, params)
    full = add_tendrils(set(base_blob), params.total_tiles, rng, params)
    if len(full) > params.total_tiles:
        full = set(list(full)[: params.total_tiles])
    hexes = list(full)

    if params.color_mode == 'random':
        cols = assign_colors_random(hexes, rng, params.colors, params.counts)
    elif params.color_mode == 'gradient':
        cols = assign_colors_gradient(hexes, rng, params)
    elif params.color_mode == 'scheme60':
        cols = assign_colors_scheme60(hexes, rng, params)
    else:
        cols = assign_colors_random(hexes, rng, params.colors, params.counts)
    return hexes, cols

# app/hexgrid.py
from __future__ import annotations
import math
from dataclasses import dataclass
from typing import List, Tuple, Set
import io
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import RegularPolygon
from PIL import Image

# -------------------------------
# Basic hex geometry (pointy-top axial)
# -------------------------------
DIRECTIONS: List[Tuple[int, int]] = [(1,0),(1,-1),(0,-1),(-1,0),(-1,1),(0,1)]

@dataclass(frozen=True)
class Hex:
    q: int
    r: int

    def neighbors(self) -> List["Hex"]:
        return [Hex(self.q + dq, self.r + dr) for (dq, dr) in DIRECTIONS]

def axial_to_pixel(h: Hex, R: float) -> Tuple[float, float]:
    # pointy-top axial
    x = R * (1.5 * h.q)
    y = R * ((math.sqrt(3)/2) * h.q + math.sqrt(3) * h.r)
    return x, y
# -------------------------------
# Metrics
# -------------------------------
def pixel_bbox(hexes: List[Hex], R: float) -> Tuple[float, float, float, float]:
    xs, ys = zip(*(axial_to_pixel(h, R) for h in hexes))
    # add full-hex padding so bbox encloses whole tiles
    dx = (math.sqrt(3)/2.0) * R
    dy = 1.0 * R
    return min(xs)-dx, min(ys)-dy, max(xs)+dx, max(ys)+dy
# public alias (compat with previous code)
def full_tile_bbox(hexes: List[Hex], R: float) -> Tuple[float, float, float, float]:
    return pixel_bbox(hexes, R)

def aspect_ratio(hexes: List[Hex], R: float) -> float:
    x0,y0,x1,y1 = pixel_bbox(hexes, R)
    return max(1e-6, (x1-x0)) / max(1e-6, (y1-y0))

def eccentricity(hexes: List[Hex], R: float) -> float:
    if len(hexes) < 3:
        return 0.0
    xs, ys = zip(*(axial_to_pixel(h, R) for h in hexes))
    X = np.vstack([np.array(xs) - np.mean(xs), np.array(ys) - np.mean(ys)])
    C = (X @ X.T) / max(1, X.shape[1] - 1)
    vals, _ = np.linalg.eig(C)
    lam_max = float(np.max(vals))
    lam_min = float(np.min(vals))
    d = lam_max + lam_min
    if d <= 1e-9: 
        return 0.0
    return (lam_max - lam_min) / d  # in [0,1], higher == skinnier

def exposed_edges(S: Set[Hex]) -> int:
    n = 0
    for h in S:
        for dq,dr in DIRECTIONS:
            if Hex(h.q+dq, h.r+dr) not in S:
                n += 1
    return n

# -------------------------------
# Rendering
# -------------------------------
def figure_for_layout(hexes: List[Hex], colors: List[str], R: float, border=True) -> plt.Figure:
    fig, ax = plt.subplots(figsize=(6,5))
    for (h, col) in sorted(zip(hexes, colors), key=lambda t: (t[0].q, t[0].r)):
        x, y = axial_to_pixel(h, R)
        ax.add_patch(
            RegularPolygon((x, y), numVertices=6, radius=R,
                           orientation=math.radians(30),
                           edgecolor='black' if border else 'none',
                           facecolor=col, linewidth=1.0)
        )
    ax.set_aspect('equal'); ax.axis('off')
    return fig

def transparent_png_bytes(hexes: List[Hex], colors: List[str], R: float, dpi: int=220) -> bytes:
    fig, ax = plt.subplots(figsize=(6,5), dpi=dpi)
    for (h, col) in sorted(zip(hexes, colors), key=lambda t: (t[0].q, t[0].r)):
        x, y = axial_to_pixel(h, R)
        ax.add_patch(
            RegularPolygon((x, y), numVertices=6, radius=R,
                           orientation=math.radians(30),
                           edgecolor='none', facecolor=col, linewidth=1.0)
        )
    x0,y0,x1,y1 = full_tile_bbox(hexes, R)
    pad = 0.5 * R
    ax.set_xlim(x0 - pad, x1 + pad); ax.set_ylim(y0 - pad, y1 + pad)
    ax.set_aspect('equal'); ax.axis('off')
    buf = io.BytesIO()
    fig.savefig(buf, format='png', transparent=True, bbox_inches='tight', pad_inches=0)
    plt.close(fig); buf.seek(0)
    return buf.getvalue()

# -------------------------------
# Palette helpers
# -------------------------------
def balanced_palette(colors: List[str], counts: List[int], seed: int, N: int) -> List[str]:
    """
    Create a palette of length N using a round-robin over colors, weighted by counts.
    This avoids large contiguous blocks (which can look like triangles/wedges).
    """
    rng = np.random.default_rng(int(seed))
    slots = []
    for c, k in zip(colors, counts):
        slots.extend([c]*int(k))
    if len(slots) < N:
        slots.extend([colors[0]] * (N - len(slots)))
    # Balanced interleave: shuffle small chunks and interleave by modulo classes
    rng.shuffle(slots)
    buckets = [[] for _ in range(min(len(colors), 6))]
    for i, c in enumerate(slots[:N]):
        buckets[i % len(buckets)].append(c)
    out = []
    for b in buckets:
        rng.shuffle(b)
    # weave
    for i in range(max(len(b) for b in buckets)):
        for b in buckets:
            if i < len(b):
                out.append(b[i])
    return out[:N]

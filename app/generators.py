# app/generators.py
from __future__ import annotations
import math
from typing import List, Tuple, Set
import numpy as np
from .hexgrid import Hex, axial_to_pixel, aspect_ratio, eccentricity, exposed_edges

# -------------------------------
# 1) Ellipse-mask (compact by construction, aspect-aware)
# -------------------------------
def _hex_area(R: float) -> float:
    return (3.0 * math.sqrt(3.0) / 2.0) * (R**2)

def _ellipse_radii(N: int, aspect: float, R: float) -> Tuple[float,float]:
    # pi * Rx * Ry ~= N * A_hex; Rx/Ry = aspect => Rx = k*aspect, Ry = k
    k = math.sqrt(max(1e-9, (N * _hex_area(R)) / (math.pi * max(1e-9, aspect))))
    return k*aspect, k

def ellipse_mask_layout(N: int, R: float, aspect: float, seed: int) -> List[Hex]:
    """
    Fill an ellipse centered at (0,0) with hex centers; pick N closest to center.
    """
    rng = np.random.default_rng(int(seed))
    Rx, Ry = _ellipse_radii(N, aspect, R)

    # axial ranges generous enough to cover ellipse + margin
    q_max = int(math.ceil((Rx / (1.5*R)) * 1.4)) + 4
    r_max = int(math.ceil((Ry / (math.sqrt(3)*R)) * 1.4)) + 4

    candidates: List[Tuple[float, Hex]] = []
    for q in range(-q_max, q_max+1):
        for r in range(-r_max, r_max+1):
            h = Hex(q, r)
            x, y = axial_to_pixel(h, R)
            d2 = (x/max(1e-9, Rx))**2 + (y/max(1e-9, Ry))**2
            # keep a broad shell then sort; add tiny jitter to break ties
            if d2 <= 1.75:
                candidates.append((d2 + rng.normal(0, 1e-6), h))

    candidates.sort(key=lambda t: t[0])
    # remove dupes and truncate
    seen = set()
    picked: List[Hex] = []
    for _, h in candidates:
        key = (h.q, h.r)
        if key in seen: 
            continue
        picked.append(h); seen.add(key)
        if len(picked) >= N: break

    if len(picked) < N:
        # pad with nearest neighbors if ellipse shell was too tight (rare)
        S = set(picked)
        while len(picked) < N:
            ring = []
            for c in list(S):
                for nb in c.neighbors():
                    if nb not in S:
                        ring.append(nb)
            ring = list(dict.fromkeys(ring))  # unique order-preserving
            if not ring:
                break
            # choose closest to center
            ring.sort(key=lambda h: (h.q*h.q + h.r*h.r))
            for nb in ring:
                if (nb.q, nb.r) not in seen:
                    picked.append(nb); seen.add((nb.q, nb.r)); S.add(nb)
                    if len(picked) >= N: break
    return picked[:N]

# -------------------------------
# 2) Compact Growth v2 (cohesion/anti-line) — optional alternative
# -------------------------------
def _cov_eccentricity(S: Set[Hex], R: float) -> float:
    if not S or len(S) <= 2:
        return 0.0
    xs, ys = zip(*(axial_to_pixel(h, R) for h in S))
    X = np.vstack([np.array(xs) - np.mean(xs), np.array(ys) - np.mean(ys)])
    C = (X @ X.T) / max(1, X.shape[1] - 1)
    vals, _ = np.linalg.eig(C)
    lam_max = float(np.max(vals)); lam_min = float(np.min(vals))
    d = lam_max + lam_min
    if d <= 1e-9: return 0.0
    return (lam_max - lam_min) / d

def _neighbor_count(h: Hex, S: Set[Hex]) -> int:
    return sum(1 for dq,dr in [(1,0),(1,-1),(0,-1),(-1,0),(-1,1),(0,1)]
               if Hex(h.q+dq, h.r+dr) in S)

def _candidate_score(S: Set[Hex], c: Hex, R: float, aspect: float) -> float:
    S2 = set(S); S2.add(c)
    # aspect adherence
    ar = aspect_ratio(list(S2), R); err = abs(math.log(max(1e-9, ar/aspect)))
    aspect_term = math.exp(-9.0 * err * err)
    # cohesion
    n_adj = _neighbor_count(c, S)
    cohesion = [0.10, 0.35, 1.00, 0.9, 0.8, 0.7, 0.6][min(6, n_adj)]
    # anti-line
    anti = math.exp(-10.0 * _cov_eccentricity(S2, R))
    # exposed edges penalty (compactness)
    exp = exposed_edges(S2)
    compact = 1.0 / (1.0 + exp)
    return 0.50*aspect_term + 0.25*cohesion + 0.15*anti + 0.10*compact

def compact_growth_layout(N: int, R: float, aspect: float, seed: int) -> List[Hex]:
    rng = np.random.default_rng(int(seed))
    S: Set[Hex] = {Hex(0,0)}
    frontier: Set[Hex] = set(Hex(0,0).neighbors())
    while len(S) < N and frontier:
        cand = list(frontier)
        scores = np.array([_candidate_score(S, c, R, aspect) for c in cand], float)
        smax = float(scores.max())
        # tempered softmax
        probs = np.exp((scores - smax) / 0.08); probs /= probs.sum()
        chosen = cand[int(rng.choice(len(cand), p=probs))]
        S.add(chosen); frontier.remove(chosen)
        for nb in chosen.neighbors():
            if nb not in S:
                frontier.add(nb)
    # if still short, fill best perimeter
    while len(S) < N:
        ring = []
        for h in list(S):
            for nb in h.neighbors():
                if nb not in S and nb not in ring:
                    ring.append(nb)
        if not ring:
            break
        ring.sort(key=lambda c: _candidate_score(S, c, R, aspect), reverse=True)
        S.add(ring[0])
    return list(S)[:N]

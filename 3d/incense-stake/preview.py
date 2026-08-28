#!/usr/bin/env python3
"""Tiny headless renderer: flat-shaded painter's-algorithm PNGs of the parts."""
import math
import os
import sys

import numpy as np
import trimesh
from PIL import Image, ImageDraw

BG = (250, 248, 244)
LIGHT = np.array([0.45, -0.65, 0.62])
LIGHT = LIGHT / np.linalg.norm(LIGHT)
BASE = np.array([196, 122, 74], dtype=float)   # terracotta


def render(mesh, size=(760, 1200), yaw=28.0, pitch=18.0, pad=0.06):
    m = mesh.copy()
    m.apply_translation(-m.centroid)
    m.apply_transform(trimesh.transformations.rotation_matrix(math.radians(yaw), (0, 0, 1)))
    m.apply_transform(trimesh.transformations.rotation_matrix(math.radians(-90 + pitch), (1, 0, 0)))

    v, f = m.vertices, m.faces
    n = m.face_normals
    tri = v[f]

    W, H = size
    mn, mx = v[:, :2].min(0), v[:, :2].max(0)
    span = np.maximum(mx - mn, 1e-6)
    s = min(W * (1 - 2 * pad) / span[0], H * (1 - 2 * pad) / span[1])
    off = np.array([W / 2, H / 2]) - (mn + mx) / 2 * s

    px = tri[:, :, :2] * np.array([s, -s]) + np.array([off[0], H - off[1]])
    depth = tri[:, :, 2].mean(1)
    shade = np.clip(n @ LIGHT, 0, 1) ** 0.9 * 0.78 + 0.22
    cols = np.clip(BASE[None, :] * shade[:, None], 0, 255).astype(int)

    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    for i in np.argsort(depth):
        if n[i] @ np.array([0, 0, 1.0]) <= 0:
            continue
        d.polygon([tuple(p) for p in px[i]], fill=tuple(cols[i]))
    return img


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    out = sys.argv[1] if len(sys.argv) > 1 else here
    for name, sz in (("01_spike", (520, 1200)), ("02_segment", (520, 1200)),
                     ("03_head", (900, 900))):
        mesh = trimesh.load(os.path.join(here, name + ".stl"))
        render(mesh, sz).save(os.path.join(out, name + ".png"))
        print("wrote", name + ".png")

    # whole assembly, scaled down
    import generate as g
    parts = []
    spike = g.make_spike()
    parts.append(spike)
    seg = g.make_segment()
    for i in range(g.SEG_COUNT):
        c = seg.copy()
        c.apply_translation((0, 0, g.SPIKE_LEN + i * g.SEG_LEN))
        parts.append(c)
    head = g.make_head()
    head.apply_translation((0, 0, g.SPIKE_LEN + g.SEG_COUNT * g.SEG_LEN))
    parts.append(head)
    whole = trimesh.util.concatenate(parts)
    render(whole, (620, 1500), yaw=25, pitch=6).save(os.path.join(out, "00_assembly.png"))
    print("wrote 00_assembly.png")


if __name__ == "__main__":
    main()

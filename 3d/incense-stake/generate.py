#!/usr/bin/env python3
"""
Modular 1.5 m ground-stake incense holder.

Prints as 8 parts that stack on friction spigots and are locked with 4 mm pins.
A 10 mm wooden dowel / aluminium tube runs through the hollow core as a spine,
so the finished stake does not rely on plastic alone for bending strength.

Run:  python3 generate.py [outdir]
"""
import math
import os
import sys

import numpy as np
import trimesh

# ---------------------------------------------------------------- parameters
SEG = 128            # radial resolution

R_OUT   = 21.0       # outer radius of the mast            (D 42)
R_BORE  = 17.5       # inner bore = female socket radius    (D 35)
R_SPIG  = 17.2       # male spigot radius (0.3 mm clearance)
R_SLEEVE= 8.5        # core sleeve outer radius
R_CORE  = 5.5        # core hole radius -> 10 mm dowel      (D 11)

JOINT   = 25.0       # spigot length / socket depth
RIB_N   = 4          # ribs tying core sleeve to outer tube
RIB_T   = 3.0        # rib thickness

SEG_LEN   = 200.0    # segment pitch (bottom face -> top face)
SEG_COUNT = 6

SPIKE_LEN  = 220.0   # tip -> top face
SPIKE_CONE = 105.0   # length of the pointed part

HEAD_LEN   = 80.0

PIN_D      = 4.2     # M4 screw / 4 mm nail
PIN_Z      = 12.0    # above the joint face
PIN_OFF    = 12.0    # lateral offset so the pin misses the central dowel

STICK_D    = 4.6     # incense stick hole
STICK_N    = 8
STICK_TILT = 15.0    # degrees from vertical (sticks lean outward)
STICK_DEPTH= 34.0
STICK_R    = 24.0    # entry radius on the ash bowl

TOTAL = SPIKE_LEN + SEG_COUNT * SEG_LEN + HEAD_LEN


# ---------------------------------------------------------------- primitives
def cyl(r, h, z0=0.0, x=0.0, y=0.0):
    m = trimesh.creation.cylinder(radius=r, height=h, sections=SEG)
    m.apply_translation((x, y, z0 + h / 2.0))
    return m


def tube(r_out, r_in, h, z0=0.0):
    return cyl(r_out, h, z0).difference(cyl(r_in, h + 4, z0 - 2))


def revolve(profile):
    """profile: list of (r, z) describing a closed cross-section."""
    pts = np.array(profile, dtype=float)
    return trimesh.creation.revolve(pts, sections=SEG)


def ribs(h, z0, r_in, r_out):
    parts = []
    for i in range(RIB_N):
        a = 2 * math.pi * i / RIB_N
        b = trimesh.creation.box((r_out - r_in, RIB_T, h))
        b.apply_translation(((r_out + r_in) / 2.0, 0, z0 + h / 2.0))
        b.apply_transform(trimesh.transformations.rotation_matrix(a, (0, 0, 1)))
        parts.append(b)
    return trimesh.util.concatenate(parts)


def pin_hole(z):
    """Locking-pin hole along X, offset in Y so it clears the central dowel."""
    m = trimesh.creation.cylinder(radius=PIN_D / 2, height=3 * R_OUT, sections=48)
    m.apply_transform(trimesh.transformations.rotation_matrix(math.pi / 2, (0, 1, 0)))
    m.apply_translation((0, PIN_OFF, z))
    return m


def spigot(z_face):
    """Male spigot sitting on the top face of a part."""
    return tube(R_SPIG, R_CORE, JOINT, z_face).difference(pin_hole(z_face + PIN_Z))


# ---------------------------------------------------------------- the parts
def make_segment():
    """Straight mast segment: socket at the bottom, spigot on top."""
    body = tube(R_OUT, R_BORE, SEG_LEN, 0)
    # core sleeve + ribs stop above the socket so the spigot bottoms out
    z0 = JOINT + 0.5
    h = SEG_LEN - z0
    body = body.union(tube(R_SLEEVE, R_CORE, h, z0))
    body = body.union(ribs(h, z0, R_SLEEVE - 0.2, R_BORE + 0.2)
                      .difference(cyl(R_SLEEVE, h + 4, z0 - 2)))
    body = body.union(spigot(SEG_LEN))
    body = body.difference(pin_hole(PIN_Z))          # socket side of the pin
    body = body.difference(cyl(R_CORE, SEG_LEN + JOINT + 4, -2))
    return body


def make_spike():
    """Ground spike: point at the bottom, spigot on top."""
    p = [(0, 0), (R_OUT, SPIKE_CONE), (R_OUT, SPIKE_LEN), (0, SPIKE_LEN)]
    body = revolve(p)
    body = body.union(spigot(SPIKE_LEN))
    # dowel socket, stopping where the cone gets thin
    body = body.difference(cyl(R_CORE, SPIKE_LEN + JOINT + 4 - 55, 55))
    # hollow out the shaft a little to save filament
    body = body.difference(tube(R_BORE - 3, R_SLEEVE, SPIKE_LEN - 130, 120))
    return body


def make_head():
    """Crown: ash bowl + angled incense-stick holes."""
    RIM_R, RIM_Z, BOWL_R, BOWL_Z = 36.0, 80.0, 10.0, 66.0
    p = [(0, 0), (R_OUT, 0), (R_OUT, 42), (40, 68), (40, RIM_Z),
         (RIM_R, RIM_Z), (BOWL_R, BOWL_Z), (0, BOWL_Z)]
    body = revolve(p)
    body = body.difference(cyl(R_BORE, JOINT, -0.001))       # socket
    body = body.difference(pin_hole(PIN_Z))
    body = body.difference(cyl(R_CORE, 30, JOINT - 0.001))   # dowel tip pocket

    # entry point on the sloping bowl surface, at radius STICK_R
    f = (RIM_R - STICK_R) / (RIM_R - BOWL_R)
    entry_z = RIM_Z - f * (RIM_Z - BOWL_Z)

    t = math.radians(STICK_TILT)
    for i in range(STICK_N):
        a = 2 * math.pi * i / STICK_N
        h = STICK_DEPTH + 20                                 # 20 mm proud of the surface
        m = trimesh.creation.cylinder(radius=STICK_D / 2, height=h, sections=48)
        m.apply_translation((0, 0, h / 2 - STICK_DEPTH))     # origin = entry point
        m.apply_transform(trimesh.transformations.rotation_matrix(t, (0, 1, 0)))
        m.apply_translation((STICK_R, 0, entry_z))
        m.apply_transform(trimesh.transformations.rotation_matrix(a, (0, 0, 1)))
        body = body.difference(m)
    return body


# ---------------------------------------------------------------- output
def flip(m):
    m = m.copy()
    m.apply_transform(trimesh.transformations.rotation_matrix(math.pi, (1, 0, 0)))
    m.apply_translation((0, 0, -m.bounds[0][2]))
    return m


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))
    os.makedirs(out, exist_ok=True)

    parts = {
        "01_spike": flip(make_spike()),   # printed tip-up, spigot on the bed
        "02_segment": make_segment(),
        "03_head": make_head(),
    }
    for name, mesh in parts.items():
        mesh.merge_vertices()
        path = os.path.join(out, name + ".stl")
        mesh.export(path)
        b = mesh.bounds
        print(f"{name:12s} {b[1][0]-b[0][0]:6.1f} x {b[1][1]-b[0][1]:6.1f} x "
              f"{b[1][2]-b[0][2]:6.1f} mm   vol {mesh.volume/1000:7.1f} cm^3   "
              f"watertight={mesh.is_watertight}")

    vol = (parts["01_spike"].volume + SEG_COUNT * parts["02_segment"].volume
           + parts["03_head"].volume) / 1000.0
    print(f"\nassembled length: {TOTAL:.0f} mm "
          f"(spike {SPIKE_LEN:.0f} + {SEG_COUNT}x{SEG_LEN:.0f} + head {HEAD_LEN:.0f})")
    print(f"solid volume: {vol:.0f} cm^3  ->  ~{vol*1.24*0.35:.0f} g PLA at 30%% infill")


if __name__ == "__main__":
    main()

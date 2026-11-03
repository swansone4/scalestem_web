"""The model run: a wing section in a teal flow field over an adaptive mesh (seamless loop for the site).

  blender -b --factory-startup -P art/blender/flow_model.py -- params.json

params.json: {"width", "height", "fps", "frames", "samples", "out", "blend", "fn_dir", optional "only": [frames]}.
Uses the AI video editor's Blender helpers (fn.py, Field Notes look). Every animated value is periodic in
`frames`, so frame frames+1 equals frame 1 and the clip loops without a seam.
"""
import json
import math
import sys

P = json.load(open(sys.argv[sys.argv.index("--") + 1], encoding="utf-8"))
sys.path.insert(0, P["fn_dir"])
import bpy  # noqa: E402
import fn  # noqa: E402

N = P["frames"]
sc = fn.setup(P, bg=(0.0045, 0.0105, 0.016, 1))
fn.glow(sc, threshold=0.7, size=6, strength=0.9)

CHORD, SPAN, THICK, AOA = 3.2, 3.4, 0.16, 0.0


def half_thickness(xc):
    """NACA 4-digit thickness distribution at chord fraction xc (0..1), scaled to CHORD."""
    if xc <= 0 or xc >= 1:
        return 0.0
    return 5 * THICK * CHORD * (0.2969 * math.sqrt(xc) - 0.126 * xc - 0.3516 * xc ** 2 + 0.2843 * xc ** 3 - 0.1036 * xc ** 4)


def rot(x, z, a=AOA):
    return x * math.cos(a) - z * math.sin(a), x * math.sin(a) + z * math.cos(a)


# the wing section: an extruded NACA 0016 profile (lift shows in the flow: upwash ahead, downwash behind)
prof = []
M = 90
for i in range(M + 1):
    xc = 0.5 * (1 - math.cos(math.pi * i / M))
    prof.append((xc * CHORD - CHORD / 2, half_thickness(xc)))
pts = prof + [(x, -z) for x, z in reversed(prof[1:-1])]
verts, faces = [], []
for y in (-SPAN / 2, SPAN / 2):
    for x, z in pts:
        rx, rz = rot(x, z)
        verts.append((rx, y, rz))
n = len(pts)
for i in range(n):
    j = (i + 1) % n
    faces.append((i, j, n + j, n + i))
faces += [tuple(range(n))[::-1], tuple(range(n, 2 * n))]
me = bpy.data.meshes.new("wing")
me.from_pydata(verts, [], faces)
me.update()
wing = bpy.data.objects.new("wing", me)
bpy.context.collection.objects.link(wing)
bev = wing.modifiers.new("bevel", "BEVEL")
bev.width, bev.segments, bev.limit_method = 0.03, 4, "ANGLE"
for p in me.polygons:
    p.use_smooth = True
fn.apply(wing, fn.mat("wing", (0.86, 0.84, 0.79, 1), rough=0.32, coat=0.5)[0])


# streamlines: a smooth potential-flow-like deflection around the section plus circulation (upwash ahead, downwash behind)
def stream_z(x, z0):
    s = 1 if z0 >= 0 else -1
    d = abs(z0)
    xc = (x + CHORD / 2) / CHORD
    body = half_thickness(min(max(xc, 0.0), 1.0)) if 0 < xc < 1 else 0.0
    bump = (body + 0.22 * math.exp(-((x / (CHORD * 0.62)) ** 2))) * math.exp(-max(d - 0.1, 0) / 0.9)
    lift = -0.32 * math.tanh(x / 1.4) * math.exp(-d / 1.6)
    return z0 + s * bump + lift


X0, X1, STEPS = -7.0, 7.5, 160
lines = []
for y in (-1.25, -0.42, 0.42, 1.25):
    for z0 in (-1.35, -0.85, -0.45, -0.16, 0.16, 0.45, 0.85, 1.35):
        line = []
        for k in range(STEPS + 1):
            x = X0 + (X1 - X0) * k / STEPS
            z = stream_z(x, z0)
            line.append((x, y + 0.05 * math.sin(x * 0.6 + y), z))
        lines.append(line)

tube_mat = fn.mat("stream", fn.TEAL, rough=0.5, emit=fn.TEAL, strength=0.55)[0]
for i, line in enumerate(lines):
    cu = bpy.data.curves.new(f"s{i}", "CURVE")
    cu.dimensions, cu.bevel_depth, cu.bevel_resolution = "3D", 0.0065, 2
    sp = cu.splines.new("POLY")
    sp.points.add(len(line) - 1)
    for k, (x, y, z) in enumerate(line):
        sp.points[k].co = (x, y, z, 1)
    o = bpy.data.objects.new(f"s{i}", cu)
    bpy.context.collection.objects.link(o)
    o.data.materials.append(tube_mat)


def along(line, u):
    """Point at fraction u (0..1) of the polyline's length."""
    seg = [math.dist(line[k], line[k + 1]) for k in range(len(line) - 1)]
    target, acc = u * sum(seg), 0.0
    for k, s in enumerate(seg):
        if acc + s >= target:
            t = (target - acc) / s if s else 0
            a, b = line[k], line[k + 1]
            return tuple(a[j] + (b[j] - a[j]) * t for j in range(3))
        acc += s
    return line[-1]


# pulses: bright beads riding each streamline; two per line, each covering exactly one length per loop
bead_mat = fn.mat("bead", (0.75, 1.0, 0.93, 1), emit=(0.55, 1.0, 0.86, 1), strength=6.0)[0]
for i, line in enumerate(lines):
    for b in range(2):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.026, segments=16, ring_count=8)
        bead = bpy.context.object
        fn.apply(bead, bead_mat)
        phase = ((i * 0.6180339) % 1 + b * 0.5) % 1
        for f in range(1, N + 2):
            u = (phase + (f - 1) / N) % 1
            bead.location = along(line, u)
            sc_ = 1.0 if 0.03 < u < 0.97 else 0.0  # hide at the wrap so beads never jump across the frame
            bead.scale = (sc_, sc_, sc_)
            bead.keyframe_insert("location", frame=f)
            bead.keyframe_insert("scale", frame=f)
        for fc in bead.animation_data.action.fcurves if hasattr(bead.animation_data.action, "fcurves") else []:
            for kp in fc.keyframe_points:
                kp.interpolation = "LINEAR"


# the adaptive mesh: a quadtree floor that refines toward the section and its wake (as in the AMR lessons)
FLOOR_Z = -1.9


def need(cx, cy, size):
    dx = max(abs(cx) - CHORD / 2, 0) if cx < CHORD / 2 else max(cx - CHORD / 2 - 2.8, 0) * 0.35
    dy = max(abs(cy) - SPAN / 2, 0)
    d = math.hypot(dx, dy)
    return size > 0.22 + 0.55 * d


cells = []


def split(cx, cy, size, depth):
    if depth < 5 and need(cx, cy, size):
        h = size / 2
        for ox in (-h / 2, h / 2):
            for oy in (-h / 2, h / 2):
                split(cx + ox, cy + oy, h, depth + 1)
    else:
        cells.append((cx, cy, size))


for gx in range(-4, 5):
    for gy in range(-3, 4):
        split(gx * 1.8, gy * 1.8, 1.8, 0)
gv, gf = [], []
for cx, cy, s in cells:
    h = s / 2
    k = len(gv)
    gv += [(cx - h, cy - h, FLOOR_Z), (cx + h, cy - h, FLOOR_Z), (cx + h, cy + h, FLOOR_Z), (cx - h, cy + h, FLOOR_Z)]
    gf.append((k, k + 1, k + 2, k + 3))
gm = bpy.data.meshes.new("amr")
gm.from_pydata(gv, [], gf)
gm.update()
grid = bpy.data.objects.new("amr", gm)
bpy.context.collection.objects.link(grid)
wf = grid.modifiers.new("wire", "WIREFRAME")
wf.thickness, wf.use_relative_offset = 0.012, False
fn.apply(grid, fn.mat("amr", fn.TEAL_DEEP, rough=0.6, emit=fn.TEAL, strength=0.35)[0])
bpy.ops.mesh.primitive_plane_add(size=80, location=(0, 0, FLOOR_Z - 0.01))
fn.apply(bpy.context.object, fn.mat("floor", (0.004, 0.012, 0.017, 1), rough=0.22, coat=0.7)[0])

# light and camera: a slow sway whose period is the loop
fn.area((2.5, -5.5, 6.0), 900, size=6, target=(0, 0, 0))
fn.area((-6, 4, 3), 260, size=8, color=(0.6, 0.95, 0.88), target=(0, 0, 0))
cam, tgt = fn.camera((7.6, -9.6, 3.7), (0.8, 0.3, -0.45), lens=40, dof=None)
for f in range(1, N + 2, 4):
    t = 2 * math.pi * (f - 1) / N
    cam.location = (7.6 + 0.35 * math.sin(t), -9.6 + 0.2 * math.cos(t), 3.7 + 0.12 * math.sin(t))
    cam.keyframe_insert("location", frame=f)

fn.render(P)

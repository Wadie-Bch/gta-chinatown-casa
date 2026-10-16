class_name LowPoly
extends RefCounted
## Flat-shaded, vertex-coloured meshes built with SurfaceTool (mountains, rocks, terrain).


static func vcol_material(rough: float = 1.0) -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	m.vertex_color_use_as_albedo = true
	m.roughness = rough
	return m


static func _tri(st: SurfaceTool, a: Vector3, b: Vector3, c: Vector3, col: Color) -> void:
	var n := (c - a).cross(b - a).normalized()
	if n.y < -0.0001:
		# Keep faces pointing outward/upward with a consistent winding.
		var t := b
		b = c
		c = t
		n = -n
	st.set_color(col)
	st.set_normal(n)
	st.add_vertex(a)
	st.set_color(col)
	st.set_normal(n)
	st.add_vertex(b)
	st.set_color(col)
	st.set_normal(n)
	st.add_vertex(c)


## A jagged mountain peak. Colours run from rock to snow with altitude.
static func peak(rng: RandomNumberGenerator, radius: float, height: float, segs: int,
		rock: Color, rock_dark: Color, snow: Color, snow_line: float) -> ArrayMesh:
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	var ring_h := [0.0, 0.35, 0.68, 0.9]
	var ring_r := [1.0, 0.62, 0.3, 0.1]
	var rings: Array = []
	for ri in ring_h.size():
		var pts: Array[Vector3] = []
		for s in segs:
			var a := TAU * float(s) / float(segs) + rng.randf_range(-0.15, 0.15)
			var rr: float = radius * float(ring_r[ri]) * rng.randf_range(0.75, 1.2)
			var hh: float = height * float(ring_h[ri]) * rng.randf_range(0.9, 1.1)
			pts.append(Vector3(cos(a) * rr, hh, sin(a) * rr))
		rings.append(pts)
	var apex := Vector3(rng.randf_range(-0.1, 0.1) * radius, height, rng.randf_range(-0.1, 0.1) * radius)
	for ri in rings.size():
		var lo: Array[Vector3] = rings[ri]
		for s in segs:
			var s2 := (s + 1) % segs
			if ri < rings.size() - 1:
				var hi: Array[Vector3] = rings[ri + 1]
				var c1 := _rock_col(rng, (lo[s].y + hi[s].y) * 0.5 / height, rock, rock_dark, snow, snow_line)
				var c2 := _rock_col(rng, (lo[s2].y + hi[s2].y) * 0.5 / height, rock, rock_dark, snow, snow_line)
				_tri(st, lo[s], hi[s], lo[s2], c1)
				_tri(st, lo[s2], hi[s], hi[s2], c2)
			else:
				var c := _rock_col(rng, 0.95, rock, rock_dark, snow, snow_line)
				_tri(st, lo[s], apex, lo[s2], c)
	return st.commit()


static func _rock_col(rng: RandomNumberGenerator, h01: float, rock: Color, rock_dark: Color,
		snow: Color, snow_line: float) -> Color:
	var c := rock.lerp(rock_dark, rng.randf_range(0.0, 0.7))
	if h01 > snow_line + rng.randf_range(-0.06, 0.06):
		c = snow.lerp(Color(0.75, 0.8, 0.95), rng.randf_range(0.0, 0.35))
	return c


## A faceted boulder.
static func rock(rng: RandomNumberGenerator, size: Vector3, col: Color) -> ArrayMesh:
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	var segs := 6
	var rings := 4
	var verts: Array = []
	for r in rings + 1:
		var v := float(r) / float(rings)
		var phi := v * PI
		var row: Array[Vector3] = []
		for s in segs:
			var th := TAU * float(s) / float(segs)
			var j := rng.randf_range(0.8, 1.15) if r > 0 and r < rings else 1.0
			row.append(Vector3(sin(phi) * cos(th) * size.x * j, cos(phi) * size.y * j, sin(phi) * sin(th) * size.z * j))
		verts.append(row)
	for r in rings:
		var a_row: Array[Vector3] = verts[r]
		var b_row: Array[Vector3] = verts[r + 1]
		for s in segs:
			var s2 := (s + 1) % segs
			var c := col.darkened(rng.randf_range(0.0, 0.3))
			_tri_raw(st, a_row[s], a_row[s2], b_row[s], c)
			_tri_raw(st, a_row[s2], b_row[s2], b_row[s], c)
	return st.commit()


static func _tri_raw(st: SurfaceTool, a: Vector3, b: Vector3, c: Vector3, col: Color) -> void:
	var n := (b - a).cross(c - a).normalized()
	var centre := (a + b + c) / 3.0
	if n.dot(centre) < 0.0:
		n = -n
		var t := b
		b = c
		c = t
	for v in [a, c, b]:
		st.set_color(col)
		st.set_normal(n)
		st.add_vertex(v)


## Rolling foothills around the arena; flat inside `flat_radius`.
static func terrain(rng: RandomNumberGenerator, extent: float, cells: int, flat_radius: float,
		sand: Color, earth: Color, scrub: Color) -> ArrayMesh:
	var noise := FastNoiseLite.new()
	noise.seed = rng.randi()
	noise.frequency = 0.018
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	var step := extent * 2.0 / float(cells)
	var hgt := func(x: float, z: float) -> float:
		var r := Vector2(x, z).length()
		var t := clampf((r - flat_radius) / 40.0, 0.0, 1.0)
		return -0.62 + t * t * (4.0 + noise.get_noise_2d(x, z) * 9.0) + noise.get_noise_2d(x * 3.0, z * 3.0) * 0.25 * t
	for iz in cells:
		for ix in cells:
			var x0 := -extent + ix * step
			var z0 := -extent + iz * step
			var p00 := Vector3(x0, hgt.call(x0, z0), z0)
			var p10 := Vector3(x0 + step, hgt.call(x0 + step, z0), z0)
			var p01 := Vector3(x0, hgt.call(x0, z0 + step), z0 + step)
			var p11 := Vector3(x0 + step, hgt.call(x0 + step, z0 + step), z0 + step)
			var n1 := noise.get_noise_2d(x0 * 4.0, z0 * 4.0)
			var c1 := sand.lerp(earth, clampf(0.5 + n1, 0.0, 1.0))
			if n1 > 0.32:
				c1 = c1.lerp(scrub, 0.6)
			var c2 := c1.darkened(rng.randf_range(0.0, 0.12))
			_tri(st, p00, p01, p10, c1)
			_tri(st, p10, p01, p11, c2)
	return st.commit()

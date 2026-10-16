class_name Arena
extends Node3D
## Builds the ancient North African mountain arena procedurally: a paved stone
## platform with inlaid motifs, ruined pillars, a rammed-earth gate and kasbah
## towers, braziers, woven banners, Atlas peaks, the sky and the star rift.

const ARENA_RADIUS := 14.5
const MOVE_RADIUS := 13.6
const RIFT_DIR := Vector3(0.0, 0.42, -0.91)

var rng := RandomNumberGenerator.new()
var beam: MeshInstance3D
var _beam_mat: ShaderMaterial
var _fires: Array = []
var _t := 0.0

var sandstone := Build.mat(Color(0.8, 0.62, 0.44), 0.92)
var sandstone_dark := Build.mat(Color(0.6, 0.44, 0.31), 0.95)
var bronze := Build.mat(Color(0.82, 0.56, 0.24), 0.35, 0.85)
var wood := Build.mat(Color(0.3, 0.19, 0.11), 0.85)


func build(world_env: WorldEnvironment, sun: DirectionalLight3D, rim: DirectionalLight3D) -> void:
	rng.seed = 20241
	_environment(world_env, sun, rim)
	_ground()
	_platform()
	_bounds()
	_pillars()
	_gate()
	_kasbah()
	_braziers()
	_banners()
	_scatter()
	_mountains()
	_sky_rift()
	_ambient_particles()


func _process(delta: float) -> void:
	_t += delta
	for f: Array in _fires:
		var l: OmniLight3D = f[0]
		var base: float = f[1]
		var ph: float = f[2]
		l.light_energy = base * (0.85 + 0.12 * sin(_t * 11.0 + ph) + 0.08 * sin(_t * 23.0 + ph * 2.0))


# ---------------------------------------------------------------- lighting

func _environment(world_env: WorldEnvironment, sun: DirectionalLight3D, rim: DirectionalLight3D) -> void:
	var env := Environment.new()
	env.background_mode = Environment.BG_SKY
	var sky := Sky.new()
	var sm := ShaderMaterial.new()
	sm.shader = preload("res://shaders/sky.gdshader")
	sky.sky_material = sm
	sky.radiance_size = Sky.RADIANCE_SIZE_64
	env.sky = sky
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color(0.5, 0.5, 0.72)
	env.ambient_light_energy = 0.6
	env.reflected_light_source = Environment.REFLECTION_SOURCE_SKY
	env.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	env.tonemap_exposure = 1.05
	env.tonemap_white = 6.0
	env.glow_enabled = true
	env.glow_intensity = 0.55
	env.glow_strength = 0.9
	env.glow_bloom = 0.0
	env.glow_hdr_threshold = 1.05
	# Tight glow only: wide blur levels turn bright pixels into large halos.
	var levels := [0.0, 0.6, 1.0, 0.35, 0.0, 0.0, 0.0]
	for i in levels.size():
		env.set_glow_level(i, float(levels[i]))
	env.glow_blend_mode = Environment.GLOW_BLEND_MODE_SCREEN
	env.fog_enabled = true
	env.fog_light_color = Color(0.92, 0.64, 0.48)
	env.fog_light_energy = 1.0
	env.fog_density = 0.0045
	env.fog_sky_affect = 0.0
	env.fog_sun_scatter = 0.2
	env.adjustment_enabled = true
	env.adjustment_contrast = 1.08
	env.adjustment_saturation = 1.12
	world_env.environment = env

	sun.light_color = Color(1.0, 0.76, 0.52)
	sun.light_energy = 1.6
	sun.shadow_enabled = true
	sun.directional_shadow_max_distance = 40.0
	sun.shadow_blur = 1.2
	var dir := Vector3(-0.62, -0.42, -0.66).normalized()
	sun.global_transform = Transform3D(Basis.looking_at(dir, Vector3.UP), Vector3.ZERO)

	# Cool rim light from the rift side so silhouettes read against the warm ground.
	rim.light_color = Color(0.55, 0.55, 1.0)
	rim.light_energy = 0.75
	rim.shadow_enabled = false
	var rdir := Vector3(0.25, -0.35, 0.9).normalized()
	rim.global_transform = Transform3D(Basis.looking_at(rdir, Vector3.UP), Vector3.ZERO)


# ---------------------------------------------------------------- ground

func _ground() -> void:
	var mesh := LowPoly.terrain(rng, 260.0, 72, 17.0, Color(0.8, 0.6, 0.4), Color(0.62, 0.36, 0.22), Color(0.42, 0.42, 0.24))
	var mi := MeshInstance3D.new()
	mi.mesh = mesh
	mi.material_override = LowPoly.vcol_material()
	add_child(mi)
	var body := StaticBody3D.new()
	body.collision_layer = 1
	body.collision_mask = 0
	var cs := CollisionShape3D.new()
	var bs := BoxShape3D.new()
	bs.size = Vector3(400, 2, 400)
	cs.shape = bs
	cs.position = Vector3(0, -1, 0)
	body.add_child(cs)
	add_child(body)


func _platform() -> void:
	var floor_mat := ShaderMaterial.new()
	floor_mat.shader = preload("res://shaders/arena_floor.gdshader")
	floor_mat.set_shader_parameter("arena_radius", ARENA_RADIUS)
	var top := Build.part(self, Build.cyl(ARENA_RADIUS, ARENA_RADIUS + 0.5, 0.7, 72), floor_mat, Vector3(0, -0.35, 0))
	top.name = "ArenaFloor"
	Build.part(self, Build.cyl(ARENA_RADIUS + 1.4, ARENA_RADIUS + 1.9, 0.5, 72), sandstone_dark, Vector3(0, -0.6, 0))
	var kerb := TorusMesh.new()
	kerb.inner_radius = ARENA_RADIUS - 0.25
	kerb.outer_radius = ARENA_RADIUS + 0.3
	kerb.rings = 72
	kerb.ring_segments = 6
	Build.part(self, kerb, sandstone_dark, Vector3(0, 0.0, 0), Vector3.ZERO, Vector3(1, 0.35, 1))


func _bounds() -> void:
	var body := StaticBody3D.new()
	body.name = "ArenaBounds"
	body.collision_layer = 1
	body.collision_mask = 0
	var n := 36
	for i in n:
		var a := TAU * i / n
		var cs := CollisionShape3D.new()
		var bs := BoxShape3D.new()
		bs.size = Vector3(TAU * (MOVE_RADIUS + 0.6) / n + 0.3, 6.0, 1.0)
		cs.shape = bs
		var r := MOVE_RADIUS + 0.9
		cs.position = Vector3(cos(a) * r, 3.0, sin(a) * r)
		cs.rotation.y = -a + PI * 0.5
		body.add_child(cs)
	add_child(body)


# ---------------------------------------------------------------- ruins

func _pillars() -> void:
	var count := 14
	for i in count:
		var a := TAU * i / count + 0.11
		var pos := Vector3(cos(a), 0, sin(a)) * rng.randf_range(17.0, 18.5)
		if absf(pos.x) < 5.0 and pos.z < -10.0:
			continue
		var h := rng.randf_range(2.5, 7.5)
		var full := rng.randf() < 0.45
		if full:
			h = 7.2
		var p := Node3D.new()
		add_child(p)
		p.position = pos
		p.rotation.y = rng.randf() * TAU
		Build.part(p, Build.box(1.3, 0.55, 1.3), sandstone_dark, Vector3(0, 0.0, 0))
		Build.part(p, Build.cyl(0.46, 0.5, h, 10), sandstone, Vector3(0, h * 0.5 + 0.27, 0))
		Build.part(p, Build.cyl(0.52, 0.52, 0.18, 10), sandstone_dark, Vector3(0, 0.36, 0))
		if full:
			Build.part(p, Build.cyl(0.62, 0.48, 0.3, 10), sandstone_dark, Vector3(0, h + 0.4, 0))
			Build.part(p, Build.box(1.25, 0.32, 1.25), sandstone, Vector3(0, h + 0.7, 0))
		else:
			Build.part(p, Build.cyl(0.2, 0.46, 0.5, 6), sandstone, Vector3(0.1, h + 0.45, 0), Vector3(0, 0, rng.randf_range(-25, 25)))
			var chunk := Build.part(self, Build.cyl(0.46, 0.46, rng.randf_range(0.9, 1.8), 10), sandstone, pos + Vector3(rng.randf_range(-2, 2), 0.45, rng.randf_range(-2, 2)))
			chunk.rotation_degrees = Vector3(90, rng.randf() * 360.0, 0)
	for k in 2:
		var a := rng.randf_range(0.0, TAU)
		var fp := Vector3(cos(a), 0, sin(a)) * 21.0
		var fallen := Build.part(self, Build.cyl(0.48, 0.5, 6.5, 10), sandstone, fp + Vector3(0, 0.45, 0))
		fallen.rotation_degrees = Vector3(90, rng.randf() * 360.0, 0)


func _pise(frieze_y: float, base: Color = Color(0.72, 0.42, 0.26)) -> ShaderMaterial:
	var m := ShaderMaterial.new()
	m.shader = preload("res://shaders/pise_wall.gdshader")
	m.set_shader_parameter("frieze_y", frieze_y)
	m.set_shader_parameter("base_col", base)
	m.set_shader_parameter("dark_col", base.darkened(0.3))
	return m


func _gate() -> void:
	var g := Node3D.new()
	g.name = "Gate"
	add_child(g)
	g.position = Vector3(0, 0, -21.5)
	var mat := _pise(7.4)
	for side: int in [1, -1]:
		Build.part(g, Build.box(1.8, 8.0, 1.9), mat, Vector3(3.3 * side, 4.0, 0))
		Build.part(g, Build.box(2.1, 0.5, 2.2), mat, Vector3(3.3 * side, 0.25, 0))
		for c in 2:
			Build.part(g, Build.box(0.5, 0.7, 0.5), mat, Vector3(3.3 * side + (c - 0.5) * 1.1, 9.9, 0))
	Build.part(g, Build.box(8.6, 1.6, 2.1), mat, Vector3(0, 8.6, 0))
	for c in 5:
		Build.part(g, Build.box(0.55, 0.7, 0.55), mat, Vector3(-2.2 + c * 1.1, 9.75, 0))
	# Bronze lozenge emblem on the lintel.
	Build.part(g, Build.box(0.9, 0.9, 0.12), bronze, Vector3(0, 8.6, 1.08), Vector3(0, 0, 45))
	Build.part(g, Build.box(0.45, 0.45, 0.14), Build.mat(Color(0.12, 0.2, 0.5), 0.6), Vector3(0, 8.6, 1.12), Vector3(0, 0, 45))
	# Low walls running from the gate.
	for side: int in [1, -1]:
		var wall := Build.part(g, Build.box(9.0, 3.6, 1.2), _pise(2.6), Vector3(8.6 * side, 1.8, 1.6))
		wall.rotation_degrees = Vector3(0, -14 * side, 0)


func _kasbah() -> void:
	var spots := [
		Vector3(-15, 0, -33), Vector3(14, 0, -35), Vector3(-31, 0, -15), Vector3(32, 0, -20),
		Vector3(-28, 0, 22), Vector3(27, 0, 27), Vector3(3, 0, 38), Vector3(-6, 0, -48), Vector3(40, 0, 6),
	]
	for p: Vector3 in spots:
		var h := rng.randf_range(9.0, 15.0)
		var w := rng.randf_range(2.4, 3.4)
		var t := Node3D.new()
		add_child(t)
		t.position = p - Vector3(0, 0.4, 0)
		t.rotation.y = rng.randf_range(-0.3, 0.3)
		var mat := _pise(h - 2.4, Color(0.72, 0.42, 0.26).lerp(Color(0.64, 0.36, 0.24), rng.randf()))
		var body := Build.part(t, Build.cyl(w * 0.72, w, h, 4), mat, Vector3(0, h * 0.5, 0))
		body.rotation_degrees = Vector3(0, 45, 0)
		for c in 4:
			var a := TAU * c / 4.0
			var cp := Vector3(cos(a), 0, sin(a)) * w * 0.68
			Build.part(t, Build.cyl(0.0, 0.42, 1.3, 4), mat, cp + Vector3(0, h + 0.55, 0))
		for wnd in 3:
			var wy := h * (0.45 + wnd * 0.15)
			Build.part(t, Build.box(0.3, 0.6, 0.1), Build.mat(Color(0.08, 0.05, 0.04)), Vector3(0, wy, -w * 0.62 * (1.0 - wy / h * 0.28)))
	for k in 3:
		var a := -PI * 0.5 + (k - 1) * 0.9
		var wp := Vector3(cos(a), 0, sin(a)) * 36.0
		var wall := Build.part(self, Build.box(14.0, 5.0, 1.4), _pise(3.8), wp + Vector3(0, 2.1, 0))
		wall.rotation.y = -a + PI * 0.5


func _braziers() -> void:
	for i in 4:
		var a := TAU * i / 4.0 + PI * 0.25
		var pos := Vector3(cos(a), 0, sin(a)) * (ARENA_RADIUS + 0.6)
		var b := Node3D.new()
		add_child(b)
		b.position = pos
		Build.part(b, Build.cyl(0.35, 0.45, 0.25, 8), sandstone_dark, Vector3(0, 0.12, 0))
		Build.part(b, Build.cyl(0.09, 0.12, 1.2, 6), bronze, Vector3(0, 0.8, 0))
		Build.part(b, Build.cyl(0.6, 0.28, 0.4, 10), bronze, Vector3(0, 1.55, 0))
		Build.part(b, Build.cyl(0.52, 0.52, 0.05, 10), Build.glow(Color(1.0, 0.45, 0.15), 3.0), Vector3(0, 1.73, 0))
		var fire := CPUParticles3D.new()
		fire.amount = 36
		fire.lifetime = 0.9
		fire.mesh = FX.quad_of(0.6)
		fire.material_override = Build.fx(Color.WHITE)
		fire.emission_shape = CPUParticles3D.EMISSION_SHAPE_SPHERE
		fire.emission_sphere_radius = 0.28
		fire.direction = Vector3.UP
		fire.spread = 12.0
		fire.initial_velocity_min = 1.2
		fire.initial_velocity_max = 2.4
		fire.gravity = Vector3(0, 1.2, 0)
		fire.scale_amount_min = 0.6
		fire.scale_amount_max = 1.25
		var sc := Curve.new()
		sc.add_point(Vector2(0, 0.6))
		sc.add_point(Vector2(0.3, 1.0))
		sc.add_point(Vector2(1, 0))
		fire.scale_amount_curve = sc
		var g := Gradient.new()
		g.set_color(0, Color(1.8, 1.2, 0.5, 1))
		g.set_color(1, Color(0.4, 0.08, 0.02, 0))
		g.add_point(0.4, Color(1.5, 0.5, 0.12, 0.85))
		fire.color_ramp = g
		fire.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		fire.position = Vector3(0, 1.8, 0)
		b.add_child(fire)
		var light := OmniLight3D.new()
		light.light_color = Color(1.0, 0.58, 0.28)
		light.light_energy = 2.4
		light.omni_range = 9.0
		light.position = Vector3(0, 2.4, 0)
		b.add_child(light)
		_fires.append([light, 2.4, float(i) * 1.7])


func _banners() -> void:
	var shader := preload("res://shaders/banner.gdshader")
	var count := 6
	for i in count:
		var a := TAU * i / count + PI / count
		var pos := Vector3(cos(a), 0, sin(a)) * 16.3
		var b := Node3D.new()
		add_child(b)
		b.position = pos
		b.look_at_from_position(pos, Vector3(0, 0, 0), Vector3.UP)
		Build.part(b, Build.cyl(0.07, 0.09, 6.2, 6), wood, Vector3(0, 3.1, 0))
		Build.part(b, Build.cyl(0.04, 0.04, 1.7, 6), wood, Vector3(0, 5.9, -0.12), Vector3(0, 0, 90))
		Build.part(b, Build.ball(0.12, 6, 4), bronze, Vector3(0, 6.35, 0))
		var m := ShaderMaterial.new()
		m.shader = shader
		m.set_shader_parameter("phase", float(i) * 1.3)
		if i % 2 == 1:
			m.set_shader_parameter("base", Color(0.62, 0.22, 0.12))
			m.set_shader_parameter("accent", Color(0.08, 0.14, 0.4))
		var q := QuadMesh.new()
		q.size = Vector2(1.4, 3.4)
		q.subdivide_depth = 8
		q.subdivide_width = 2
		Build.part(b, q, m, Vector3(0, 4.15, -0.14))


func _scatter() -> void:
	for i in 34:
		var a := rng.randf() * TAU
		var r := rng.randf_range(18.5, 60.0)
		var size := Vector3(rng.randf_range(0.6, 2.2), rng.randf_range(0.4, 1.5), rng.randf_range(0.6, 2.0)) * (1.0 + r / 60.0)
		var mi := MeshInstance3D.new()
		mi.mesh = LowPoly.rock(rng, size, Color(0.6, 0.4, 0.28).lerp(Color(0.5, 0.42, 0.36), rng.randf()))
		mi.material_override = LowPoly.vcol_material()
		mi.position = Vector3(cos(a) * r, 0.0, sin(a) * r)
		mi.rotation.y = rng.randf() * TAU
		add_child(mi)
	var leaf := Build.mat(Color(0.28, 0.33, 0.16), 0.95)
	var bark := Build.mat(Color(0.3, 0.2, 0.13), 0.95)
	for i in 12:
		var a := rng.randf() * TAU
		var r := rng.randf_range(23.0, 55.0)
		var t := Node3D.new()
		add_child(t)
		t.position = Vector3(cos(a) * r, -0.3, sin(a) * r)
		t.rotation.y = rng.randf() * TAU
		var s := rng.randf_range(0.8, 1.4)
		t.scale = Vector3.ONE * s
		Build.part(t, Build.cyl(0.18, 0.3, 2.2, 6), bark, Vector3(0, 1.1, 0), Vector3(0, 0, 8))
		Build.part(t, Build.cyl(0.1, 0.16, 1.4, 5), bark, Vector3(0.5, 2.3, 0), Vector3(0, 0, -40))
		for c in 3:
			Build.part(t, Build.ball(rng.randf_range(1.0, 1.5), 7, 4), leaf,
					Vector3(rng.randf_range(-1.0, 1.0), 2.9 + rng.randf_range(0, 0.6), rng.randf_range(-1.0, 1.0)),
					Vector3.ZERO, Vector3(1.3, 0.55, 1.2))


func _mountains() -> void:
	var mat := LowPoly.vcol_material()
	var rings := [
		{"n": 14, "r": [70.0, 100.0], "h": [16.0, 32.0], "rad": [18.0, 30.0], "rock": Color(0.66, 0.38, 0.24), "dark": Color(0.45, 0.25, 0.17), "snow": 1.1},
		{"n": 16, "r": [125.0, 165.0], "h": [40.0, 68.0], "rad": [30.0, 46.0], "rock": Color(0.58, 0.38, 0.3), "dark": Color(0.4, 0.27, 0.24), "snow": 0.72},
		{"n": 13, "r": [210.0, 270.0], "h": [75.0, 115.0], "rad": [45.0, 70.0], "rock": Color(0.5, 0.38, 0.36), "dark": Color(0.36, 0.28, 0.3), "snow": 0.58},
	]
	for ring: Dictionary in rings:
		var n: int = ring["n"]
		var rr: Array = ring["r"]
		var hh: Array = ring["h"]
		var rad: Array = ring["rad"]
		for i in n:
			var a := TAU * i / n + rng.randf_range(-0.15, 0.15)
			var dist := rng.randf_range(float(rr[0]), float(rr[1]))
			var mi := MeshInstance3D.new()
			mi.mesh = LowPoly.peak(rng, rng.randf_range(float(rad[0]), float(rad[1])), rng.randf_range(float(hh[0]), float(hh[1])),
					rng.randi_range(6, 9), ring["rock"], ring["dark"], Color(0.95, 0.94, 0.98), float(ring["snow"]))
			mi.material_override = mat
			mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
			mi.position = Vector3(cos(a) * dist, -1.0, sin(a) * dist)
			mi.rotation.y = rng.randf() * TAU
			add_child(mi)


func _sky_rift() -> void:
	var rift := MeshInstance3D.new()
	rift.name = "StarRift"
	var q := QuadMesh.new()
	q.size = Vector2(190, 60)
	rift.mesh = q
	var m := ShaderMaterial.new()
	m.shader = preload("res://shaders/rift.gdshader")
	rift.material_override = m
	rift.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	add_child(rift)
	var pos := RIFT_DIR.normalized() * 360.0
	rift.look_at_from_position(pos, Vector3.ZERO, Vector3.UP)
	rift.rotate_object_local(Vector3.FORWARD, deg_to_rad(-14.0))

	beam = MeshInstance3D.new()
	beam.name = "DescentBeam"
	beam.mesh = Build.cyl(0.75, 0.75, 80.0, 16)
	_beam_mat = ShaderMaterial.new()
	_beam_mat.shader = preload("res://shaders/energy_beam.gdshader")
	_beam_mat.set_shader_parameter("intensity", 0.0)
	beam.material_override = _beam_mat
	beam.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	beam.visible = false
	add_child(beam)


func show_beam(at: Vector3, fade_in: float) -> void:
	beam.visible = true
	beam.global_position = Vector3(at.x, 40.0, at.z)
	var tw := create_tween()
	tw.tween_method(func(v: float) -> void: _beam_mat.set_shader_parameter("intensity", v), 0.0, 0.55, fade_in)


func hide_beam(fade_out: float) -> void:
	var tw := create_tween()
	tw.tween_method(func(v: float) -> void: _beam_mat.set_shader_parameter("intensity", v), 0.55, 0.0, fade_out)
	tw.tween_callback(func() -> void: beam.visible = false)


func _ambient_particles() -> void:
	var dust := CPUParticles3D.new()
	dust.amount = 60
	dust.lifetime = 7.0
	dust.preprocess = 7.0
	dust.mesh = FX.quad_of(0.04)
	var dust_mat := Build.fx(Color.WHITE)
	# Fade motes that drift close to the camera so they never bloom into bokeh discs.
	dust_mat.distance_fade_mode = BaseMaterial3D.DISTANCE_FADE_PIXEL_ALPHA
	dust_mat.distance_fade_min_distance = 2.5
	dust_mat.distance_fade_max_distance = 7.0
	dust.material_override = dust_mat
	dust.emission_shape = CPUParticles3D.EMISSION_SHAPE_BOX
	dust.emission_box_extents = Vector3(16, 3, 16)
	dust.direction = Vector3(1, 0.3, 0.2)
	dust.spread = 40.0
	dust.initial_velocity_min = 0.2
	dust.initial_velocity_max = 0.7
	dust.gravity = Vector3(0, 0.08, 0)
	dust.scale_amount_min = 0.6
	dust.scale_amount_max = 1.2
	var g := Gradient.new()
	g.set_color(0, Color(1.0, 0.75, 0.45, 0))
	g.set_color(1, Color(1.0, 0.7, 0.4, 0))
	g.add_point(0.3, Color(1.0, 0.72, 0.42, 0.55))
	g.add_point(0.7, Color(0.95, 0.62, 0.36, 0.4))
	dust.color_ramp = g
	dust.position = Vector3(0, 2.5, 0)
	dust.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	add_child(dust)

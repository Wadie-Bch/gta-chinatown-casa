class_name FX
extends Node3D
## Combat feedback: particles, shockwaves, impact lights, damage numbers,
## hit-stop, slow motion, screen shake and screen flashes.

static var inst: FX

## Only the gameplay FX layer drives hit-stop / slow motion through Engine.time_scale.
var drives_time := true
var camera_rig: CameraRig
var hud: Hud
var title_font: Font

var _hitstop := 0.0
var _slow_scale := 1.0
var _slow_left := 0.0
var _streak: CylinderMesh
var _mat_cache := {}
var _quads := {}


func _enter_tree() -> void:
	inst = self


func _exit_tree() -> void:
	if inst == self:
		inst = null
	if drives_time:
		Engine.time_scale = 1.0


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	_streak = CylinderMesh.new()
	_streak.top_radius = 0.5
	_streak.bottom_radius = 0.05
	_streak.height = 1.0
	_streak.radial_segments = 4
	_streak.rings = 1


## Unscaled seconds for this frame, so hit-stop/slow-mo never freeze the effects clock.
static func real_delta(delta: float) -> float:
	var ts := Engine.time_scale
	if ts < 0.0001:
		return 1.0 / 60.0
	return minf(delta / ts, 0.1)


func _process(delta: float) -> void:
	var rdt := real_delta(delta)
	if _hitstop > 0.0:
		_hitstop -= rdt
	if _slow_left > 0.0:
		_slow_left -= rdt
		if _slow_left <= 0.0:
			_slow_scale = 1.0
	if drives_time:
		Engine.time_scale = 0.04 if _hitstop > 0.0 else _slow_scale


func hit_stop(duration: float) -> void:
	_hitstop = maxf(_hitstop, duration)


func slowmo(scale: float, duration: float) -> void:
	_slow_scale = scale
	_slow_left = duration


func shake(amount: float) -> void:
	if camera_rig:
		camera_rig.add_trauma(amount)


func flash(color: Color, duration: float = 0.18) -> void:
	if hud:
		hud.flash(color, duration)


## Billboarded particle quads sized in the mesh itself. Godot 4.4's Compatibility
## renderer ignores per-particle scale for BILLBOARD_PARTICLES, so a 1 m quad with a
## 0.1 scale would still draw 1 m wide. Scale stays relative for other renderers.
static func quad_of(size: float) -> QuadMesh:
	var key := snappedf(size, 0.005)
	if inst and inst._quads.has(key):
		return inst._quads[key]
	var q := QuadMesh.new()
	q.size = Vector2(key, key)
	if inst:
		inst._quads[key] = q
	return q


func _particle_mat(color: Color, streak: bool) -> StandardMaterial3D:
	var key := "%s_%s" % [color.to_html(), streak]
	if not _mat_cache.has(key):
		var m := Build.fx(Color.WHITE, true, not streak)
		if streak:
			m.albedo_texture = null
		_mat_cache[key] = m
	return _mat_cache[key]


## Generic one-shot particle burst.
func burst(pos: Vector3, color: Color, amount: int = 24, speed: float = 7.0, lifetime: float = 0.45,
		size: float = 0.08, gravity: float = -12.0, streak: bool = false, dir: Vector3 = Vector3.UP,
		spread: float = 180.0) -> CPUParticles3D:
	var p := CPUParticles3D.new()
	p.one_shot = true
	p.explosiveness = 0.92
	p.amount = maxi(amount, 1)
	p.lifetime = lifetime
	p.mesh = _streak if streak else quad_of(size)
	p.material_override = _particle_mat(color, streak)
	p.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	p.direction = dir
	p.spread = spread
	p.initial_velocity_min = speed * 0.35
	p.initial_velocity_max = speed
	p.gravity = Vector3(0, gravity, 0)
	p.damping_min = 1.5
	p.damping_max = 4.0
	p.particle_flag_align_y = streak
	var base := size if streak else 1.0
	p.scale_amount_min = base * 0.6
	p.scale_amount_max = base * 1.3
	var curve := Curve.new()
	curve.add_point(Vector2(0, 1))
	curve.add_point(Vector2(1, 0))
	p.scale_amount_curve = curve
	var g := Gradient.new()
	g.set_color(0, Color(color.r * 1.2, color.g * 1.2, color.b * 1.2, 1.0))
	g.set_color(1, Color(color.r, color.g * 0.6, color.b * 0.6, 0.0))
	p.color_ramp = g
	add_child(p)
	p.global_position = pos
	p.emitting = true
	get_tree().create_timer(lifetime + 0.6, true, false, true).timeout.connect(p.queue_free)
	return p


func sparks(pos: Vector3, color: Color = Color(1.0, 0.72, 0.3), amount: int = 26) -> void:
	burst(pos, color, amount, 9.0, 0.32, 0.2, -16.0, true)


func ichor(pos: Vector3, dir: Vector3, amount: int = 30) -> void:
	burst(pos, Color(0.25, 0.95, 0.8), amount, 6.5, 0.55, 0.075, -14.0, false, dir.normalized(), 55.0)
	burst(pos, Color(0.55, 0.32, 0.95), amount / 2, 3.0, 0.45, 0.1, -4.0, false, dir.normalized(), 80.0)


func dust(pos: Vector3, amount: int = 16, radius_speed: float = 3.0) -> void:
	var p := burst(pos + Vector3.UP * 0.1, Color(0.6, 0.46, 0.33), amount, radius_speed, 0.9, 0.42, 0.6,
			false, Vector3.UP, 85.0)
	p.material_override = Build.fx(Color(1, 1, 1, 0.4), false, true)
	var g := Gradient.new()
	g.set_color(0, Color(0.62, 0.47, 0.34, 0.8))
	g.set_color(1, Color(0.55, 0.42, 0.3, 0.0))
	p.color_ramp = g


func embers(pos: Vector3, amount: int = 40) -> void:
	burst(pos, Color(1.0, 0.55, 0.2), amount, 5.0, 1.2, 0.05, 2.5, false, Vector3.UP, 70.0)


## Expanding ground ring.
func shockwave(pos: Vector3, color: Color, radius: float = 3.0, duration: float = 0.45) -> void:
	var mi := MeshInstance3D.new()
	var q := QuadMesh.new()
	q.size = Vector2(2, 2)
	q.orientation = PlaneMesh.FACE_Y
	mi.mesh = q
	var m := Build.fx(color, true, false, Build.ring_tex())
	m.albedo_color = Color(color.r * 1.5, color.g * 1.5, color.b * 1.5, 1.0)
	mi.material_override = m
	mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	add_child(mi)
	mi.global_position = pos + Vector3.UP * 0.06
	mi.scale = Vector3.ONE * 0.2
	var tw := create_tween().set_parallel(true)
	tw.tween_property(mi, "scale", Vector3.ONE * radius, duration).set_trans(Tween.TRANS_EXPO).set_ease(Tween.EASE_OUT)
	tw.tween_property(m, "albedo_color:a", 0.0, duration).set_ease(Tween.EASE_IN)
	tw.chain().tween_callback(mi.queue_free)


## Short-lived light so impacts illuminate the scene around them.
func impact_light(pos: Vector3, color: Color, energy: float = 4.0, duration: float = 0.18, rng: float = 6.0) -> void:
	var l := OmniLight3D.new()
	l.light_color = color
	l.light_energy = energy * 0.6
	l.omni_range = rng * 0.7
	l.omni_attenuation = 2.0
	add_child(l)
	l.global_position = pos
	var tw := create_tween()
	tw.tween_property(l, "light_energy", 0.0, duration)
	tw.tween_callback(l.queue_free)


func damage_number(pos: Vector3, amount: float, color: Color, big: bool = false) -> void:
	var lbl := Label3D.new()
	lbl.text = str(int(round(amount)))
	if title_font:
		lbl.font = title_font
	lbl.font_size = 120 if big else 92
	lbl.outline_size = 22
	lbl.modulate = color
	lbl.outline_modulate = Color(0.08, 0.04, 0.02, 0.95)
	lbl.pixel_size = 0.0042
	lbl.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	lbl.no_depth_test = true
	lbl.render_priority = 10
	lbl.outline_render_priority = 9
	add_child(lbl)
	lbl.global_position = pos + Vector3(randf_range(-0.25, 0.25), 0.2, 0)
	lbl.scale = Vector3.ONE * 1.6
	var tw := create_tween().set_parallel(true)
	tw.tween_property(lbl, "scale", Vector3.ONE, 0.12).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	tw.tween_property(lbl, "position:y", lbl.position.y + 0.9, 0.75).set_ease(Tween.EASE_OUT)
	tw.tween_property(lbl, "modulate:a", 0.0, 0.3).set_delay(0.45)
	tw.tween_property(lbl, "outline_modulate:a", 0.0, 0.3).set_delay(0.45)
	tw.chain().tween_callback(lbl.queue_free)


func world_text(pos: Vector3, text: String, color: Color, size: int = 80) -> void:
	var lbl := Label3D.new()
	lbl.text = text
	if title_font:
		lbl.font = title_font
	lbl.font_size = size
	lbl.outline_size = 18
	lbl.modulate = color
	lbl.outline_modulate = Color(0.05, 0.03, 0.02, 0.95)
	lbl.pixel_size = 0.0042
	lbl.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	lbl.no_depth_test = true
	lbl.render_priority = 10
	lbl.outline_render_priority = 9
	add_child(lbl)
	lbl.global_position = pos
	var tw := create_tween().set_parallel(true)
	tw.tween_property(lbl, "position:y", pos.y + 0.6, 0.7).set_ease(Tween.EASE_OUT)
	tw.tween_property(lbl, "modulate:a", 0.0, 0.25).set_delay(0.5)
	tw.tween_property(lbl, "outline_modulate:a", 0.0, 0.25).set_delay(0.5)
	tw.chain().tween_callback(lbl.queue_free)

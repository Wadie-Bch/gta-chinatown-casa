class_name WeaponTrail
extends MeshInstance3D
## Ribbon that follows two markers on a blade while a swing is active.
## Samples are taken at the physics rate and smoothed with Catmull-Rom splines.

var a_node: Node3D
var b_node: Node3D
var emitting := false
var color := Color(1.0, 0.75, 0.35, 0.9)
var lifetime := 0.14
var max_samples := 14

var _samples: Array = []
var _im := ImmediateMesh.new()


func setup(a: Node3D, b: Node3D, c: Color) -> void:
	a_node = a
	b_node = b
	color = c


func _ready() -> void:
	top_level = true
	mesh = _im
	cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	var m := StandardMaterial3D.new()
	m.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	m.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
	m.vertex_color_use_as_albedo = true
	m.cull_mode = BaseMaterial3D.CULL_DISABLED
	material_override = m
	global_transform = Transform3D.IDENTITY


func _physics_process(delta: float) -> void:
	for s: Dictionary in _samples:
		s["age"] = float(s["age"]) + delta
	if emitting and a_node and b_node:
		_samples.push_front({"a": a_node.global_position, "b": b_node.global_position, "age": 0.0})
	while _samples.size() > 0 and float(_samples.back()["age"]) > lifetime:
		_samples.pop_back()
	if _samples.size() > max_samples:
		_samples.resize(max_samples)


func _process(_delta: float) -> void:
	global_transform = Transform3D.IDENTITY
	_im.clear_surfaces()
	var n := _samples.size()
	if n < 2:
		return
	_im.surface_begin(Mesh.PRIMITIVE_TRIANGLE_STRIP)
	var sub := 3
	for i in n - 1:
		for k in sub:
			var t := float(k) / float(sub)
			var a := _cr(i, t, "a")
			var b := _cr(i, t, "b")
			var age: float = lerpf(float(_samples[i]["age"]), float(_samples[i + 1]["age"]), t)
			var f := clampf(1.0 - age / lifetime, 0.0, 1.0)
			_im.surface_set_color(Color(color.r, color.g, color.b, color.a * f * f * 0.5))
			_im.surface_add_vertex(a)
			_im.surface_set_color(Color(color.r * 1.4, color.g * 1.4, color.b * 1.4, color.a * f))
			_im.surface_add_vertex(b)
	var last: Dictionary = _samples[n - 1]
	_im.surface_set_color(Color(color, 0.0))
	_im.surface_add_vertex(last["a"])
	_im.surface_set_color(Color(color, 0.0))
	_im.surface_add_vertex(last["b"])
	_im.surface_end()


func _cr(i: int, t: float, key: String) -> Vector3:
	var n := _samples.size()
	var p0: Vector3 = _samples[maxi(i - 1, 0)][key]
	var p1: Vector3 = _samples[i][key]
	var p2: Vector3 = _samples[mini(i + 1, n - 1)][key]
	var p3: Vector3 = _samples[mini(i + 2, n - 1)][key]
	var t2 := t * t
	var t3 := t2 * t
	return 0.5 * ((2.0 * p1) + (-p0 + p2) * t + (2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3) * t2 + (-p0 + 3.0 * p1 - 3.0 * p2 + p3) * t3)

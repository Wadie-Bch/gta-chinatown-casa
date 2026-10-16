class_name CameraRig
extends Node3D
## Third-person boss camera. Keeps the warrior in the foreground and the creature
## framed beyond him, with a dedicated portrait (9:16) framing mode, mouse/stick
## orbit offset, trauma-based shake and blendable cinematic shots.

var player: Warrior
var enemy: StarEater
var portrait := false
var yaw := 0.0
var orbit_mode := false

var _manual_yaw := 0.0
var _manual_timer := 0.0
var _pos := Vector3(0, 3, 10)
var _look := Vector3.ZERO
var _trauma := 0.0
var _noise := FastNoiseLite.new()
var _t := 0.0
var _cine_w := 0.0
var _cine_target := 0.0
var _cine_speed := 3.0
var _cine_pos := Vector3.ZERO
var _cine_look := Vector3.ZERO
var _fov_kick := 0.0

@onready var cam: Camera3D = $Camera3D


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	_noise.seed = 7
	_noise.frequency = 0.9
	cam.near = 0.1
	cam.far = 700.0
	cam.current = true


func set_portrait(on: bool) -> void:
	portrait = on
	if portrait:
		cam.keep_aspect = Camera3D.KEEP_WIDTH
		cam.fov = 58.0
	else:
		cam.keep_aspect = Camera3D.KEEP_HEIGHT
		cam.fov = 52.0


func add_trauma(amount: float) -> void:
	_trauma = clampf(_trauma + amount, 0.0, 1.0)


func kick_fov(amount: float) -> void:
	_fov_kick = amount


func set_cinematic(pos: Vector3, look: Vector3, blend_time: float) -> void:
	_cine_pos = pos
	_cine_look = look
	_cine_target = 1.0
	_cine_speed = 1.0 / maxf(blend_time, 0.01)


func clear_cinematic(blend_time: float) -> void:
	_cine_target = 0.0
	_cine_speed = 1.0 / maxf(blend_time, 0.01)


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseMotion and Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
		_manual_yaw -= (event as InputEventMouseMotion).relative.x * 0.0035
		_manual_yaw = clampf(_manual_yaw, -PI, PI)
		_manual_timer = 2.0


func _target_yaw() -> float:
	var p := player.global_position
	var e := enemy.global_position
	var flat := Vector3(e.x - p.x, 0, e.z - p.z)
	if enemy.state == StarEater.State.DEAD or flat.length() < 0.4:
		return yaw - _manual_yaw
	return atan2(-flat.x, -flat.z)


func _desired() -> Array:
	var p := player.global_position
	var e := enemy.global_position
	var flat := Vector3(e.x - p.x, 0, e.z - p.z)
	var sep := flat.length()
	var fwd := Vector3(-sin(yaw), 0, -cos(yaw))
	var right := Vector3(cos(yaw), 0, -sin(yaw))
	var dist: float
	var height: float
	var side: float
	var look_t: float
	var look_h: float
	if portrait:
		dist = clampf(3.3 + sep * 0.36, 4.0, 8.5)
		height = 1.75 + sep * 0.12
		side = 0.0
		look_t = 0.5
		look_h = 1.55
	else:
		dist = clampf(4.0 + sep * 0.36, 4.8, 9.5)
		height = 2.1 + sep * 0.1
		side = 1.1
		look_t = 0.42
		look_h = 1.25
	var focus_e := e
	if enemy.state == StarEater.State.DEAD:
		focus_e = p + fwd * 3.0
	focus_e.y = minf(focus_e.y, 9.0)
	var pos := p - fwd * dist + Vector3.UP * height + right * side
	var look := p.lerp(focus_e, look_t) + Vector3.UP * look_h + right * side * 0.4
	if orbit_mode:
		pos = p - fwd * 5.4 + Vector3.UP * 2.2
		look = p + Vector3.UP * 1.3
	return [pos, look]


func snap() -> void:
	yaw = _target_yaw()
	var d := _desired()
	_pos = d[0]
	_look = d[1]
	_apply(0.0)


func _process(delta: float) -> void:
	if player == null or enemy == null:
		return
	var rdt := FX.real_delta(delta)
	_t += rdt
	var cam_input := Input.get_axis("camera_left", "camera_right")
	if absf(cam_input) > 0.1:
		_manual_yaw -= cam_input * 2.2 * rdt
		_manual_timer = 2.0
	_manual_timer -= rdt
	if _manual_timer <= 0.0:
		_manual_yaw = lerpf(_manual_yaw, 0.0, 1.0 - exp(-1.2 * rdt))
	if orbit_mode:
		yaw += rdt * 0.35
	else:
		yaw = lerp_angle(yaw, _target_yaw() + _manual_yaw, 1.0 - exp(-4.0 * rdt))
	var d := _desired()
	_pos = _pos.lerp(d[0], 1.0 - exp(-6.0 * rdt))
	_look = _look.lerp(d[1], 1.0 - exp(-9.0 * rdt))
	_apply(rdt)


func _apply(rdt: float) -> void:
	_cine_w = move_toward(_cine_w, _cine_target, rdt * _cine_speed)
	var w := smoothstep(0.0, 1.0, _cine_w)
	var fpos := _pos.lerp(_cine_pos, w)
	var flook := _look.lerp(_cine_look, w)
	_trauma = maxf(_trauma - rdt * 1.7, 0.0)
	var s := _trauma * _trauma
	var off := Vector3(_noise.get_noise_2d(_t * 40.0, 0.0), _noise.get_noise_2d(0.0, _t * 40.0), _noise.get_noise_2d(_t * 40.0, 50.0)) * s * 0.45
	fpos.y = maxf(fpos.y, 0.5)
	cam.global_position = fpos + off
	if not cam.global_position.is_equal_approx(flook):
		cam.look_at(flook + off * 0.4, Vector3.UP)
	cam.rotate_object_local(Vector3.FORWARD, _noise.get_noise_2d(_t * 30.0, 99.0) * s * 0.06)
	_fov_kick = lerpf(_fov_kick, 0.0, 1.0 - exp(-6.0 * rdt))
	var base_fov := 58.0 if portrait else 52.0
	cam.fov = base_fov + _fov_kick

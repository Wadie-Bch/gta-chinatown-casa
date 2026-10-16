class_name DemoPilot
extends Node
## Plays the warrior for the recorded demonstration. It only "presses buttons":
## movement through Input.action_press and attacks/dodges/blocks through
## InputEventAction events, exactly like the keyboard or touch controls.
## It reacts to the creature's telegraphed attacks, which is why the fight
## plays out through the real combat code (hit boxes, damage, poise, AI).

var main: Main
var player: Warrior
var enemy: StarEater
var cam: CameraRig

## How the pilot answers successive parryable swipes. Slams and lunges are
## always dodged, because blocking cannot stop them.
var defense_plan: Array[String] = ["parry", "take", "parry", "block", "parry", "take"]
## Which offensive string it uses each time it gets an opening.
var offense_plan: Array[String] = ["combo3", "heavy", "combo3", "heavy", "combo2", "heavy"]

var _def_i := 0
var _off_i := 0
var _react_attack := -1
var _reaction := ""
var _dodged := false
var _dodge_dir := Vector3.ZERO
var _dodge_hold := 0.0
var _side := 1.0
var _combo_taps := 0
var _tap_cd := 0.0
var _blocking := false
var _pending_release: Array[String] = []
var _move_state := {"move_forward": 0.0, "move_back": 0.0, "move_left": 0.0, "move_right": 0.0}


func setup(m: Main) -> void:
	main = m
	player = m.player
	enemy = m.enemy
	cam = m.camera_rig


func _physics_process(delta: float) -> void:
	for a in _pending_release:
		_send(a, false)
	_pending_release.clear()
	_tap_cd -= delta
	_dodge_hold -= delta

	if main.state != Main.GameState.FIGHT or not player.is_alive():
		_move(Vector3.ZERO)
		_block(false)
		return

	var to_e := enemy.global_position - player.global_position
	to_e.y = 0.0
	var dist := to_e.length()
	var dir := to_e.normalized() if dist > 0.01 else player.facing()

	if _dodge_hold > 0.0:
		_move(_dodge_dir)
		return

	# Finish the creature once it is broken.
	if enemy.can_be_finished():
		_block(false)
		if dist > 2.8:
			_move(dir)
		else:
			_move(Vector3.ZERO)
			if _tap_cd <= 0.0:
				_tap("attack_heavy")
		return

	# React to telegraphed attacks (wind-up and strike); punish the recovery.
	if enemy.is_attacking() and enemy.active_remaining() > -0.05:
		if enemy.attack_id != _react_attack:
			_react_attack = enemy.attack_id
			var atk := enemy.current_attack()
			if atk == "slam" or atk == "lunge":
				_reaction = "dodge"
			else:
				_reaction = defense_plan[_def_i % defense_plan.size()]
				_def_i += 1
			_dodged = false
			if _reaction != "take":
				_combo_taps = 0
		var wr := enemy.windup_remaining()
		var ar := enemy.active_remaining()
		match _reaction:
			"parry":
				_block(wr <= 0.08 and ar > -0.2)
				_move(Vector3.ZERO)
				return
			"block":
				_block(wr <= 0.35 and ar > -0.15)
				_move(Vector3.ZERO)
				return
			"take":
				pass
			"dodge":
				_block(false)
				if not _dodged and wr <= 0.2:
					_dodged = true
					_side = -_side
					_dodge_dir = (dir.cross(Vector3.UP) * _side - dir * 0.35).normalized()
					_dodge_hold = 0.3
					_move(_dodge_dir)
					_tap("dodge")
				elif not _dodged:
					_move(Vector3.ZERO)
				return
	if not enemy.is_attacking() or enemy.active_remaining() <= -0.05:
		_block(false)

	# Offence.
	if _combo_taps > 0:
		_move(Vector3.ZERO)
		if _tap_cd <= 0.0 and player.state == Warrior.State.ATTACK and player.attack_time() > 0.06:
			_tap("attack_light")
			_combo_taps -= 1
		return
	if player.state != Warrior.State.FREE:
		_move(Vector3.ZERO)
		return
	if dist > 2.3:
		_move(dir)
		return
	_move(Vector3.ZERO)
	if _tap_cd > 0.0:
		return
	var plan := offense_plan[_off_i % offense_plan.size()]
	_off_i += 1
	if plan == "heavy":
		_tap("attack_heavy")
	else:
		_tap("attack_light")
		_combo_taps = 2 if plan == "combo3" else 1


func _tap(action: String) -> void:
	_send(action, true)
	_pending_release.append(action)
	_tap_cd = 0.18


func _send(action: String, pressed: bool) -> void:
	var ev := InputEventAction.new()
	ev.action = action
	ev.pressed = pressed
	ev.strength = 1.0 if pressed else 0.0
	Input.parse_input_event(ev)


func _block(on: bool) -> void:
	if on == _blocking:
		return
	_blocking = on
	_send("block", on)


## Converts a world-space direction into camera-relative stick input.
func _move(world_dir: Vector3) -> void:
	var x := 0.0
	var y := 0.0
	if world_dir.length() > 0.01:
		var yaw := cam.yaw
		var fwd := Vector3(-sin(yaw), 0, -cos(yaw))
		var right := Vector3(cos(yaw), 0, -sin(yaw))
		var d := world_dir.normalized()
		x = d.dot(right)
		y = -d.dot(fwd)
	_axis("move_right", maxf(x, 0.0))
	_axis("move_left", maxf(-x, 0.0))
	_axis("move_back", maxf(y, 0.0))
	_axis("move_forward", maxf(-y, 0.0))


func _axis(action: String, strength: float) -> void:
	if is_equal_approx(float(_move_state[action]), strength):
		return
	_move_state[action] = strength
	if strength > 0.01:
		Input.action_press(action, strength)
	else:
		Input.action_release(action)

extends Node
## Headless combat test suite. Each test spawns the real main scene, drives it
## through the normal input actions (InputEventAction) or the creature's AI
## entry points, and checks the outcome produced by the physics hit boxes.
##
## Run:  godot --headless --path . --fixed-fps 60 res://tests/test_runner.tscn
## Exit code 0 = all passed.

const MAIN_SCENE := preload("res://scenes/main.tscn")

var main: Main
var _results: Array = []
var _signals: Array[String] = []


func _ready() -> void:
	await get_tree().process_frame
	var tests := [
		"test_project_and_input_map",
		"test_scene_structure",
		"test_light_attack_hits_via_hitbox",
		"test_attack_out_of_range_misses",
		"test_three_hit_combo",
		"test_heavy_attack_damage_and_poise",
		"test_poise_break_staggers",
		"test_creature_swipe_hits_player",
		"test_block_reduces_damage",
		"test_parry_negates_and_recoils",
		"test_dodge_iframes",
		"test_slam_is_unblockable",
		"test_kill_kneel_finisher_victory",
		"test_player_death_defeat",
		"test_restart_reloads_fresh",
		"test_ai_defeats_passive_player",
		"test_demo_pilot_full_fight",
		"test_touch_button_triggers_attack",
	]
	for t: String in tests:
		_signals.clear()
		var ok := true
		var detail := ""
		var r = await call(t)
		if r is String and r != "":
			ok = false
			detail = r
		elif r is Array:
			ok = bool(r[0])
			detail = String(r[1])
		_results.append([t, ok, detail])
		print("%s  %s  %s" % ["PASS" if ok else "FAIL", t, detail])
		await _despawn()
	var failed := 0
	for r: Array in _results:
		if not r[1]:
			failed += 1
	print("RESULT: %d/%d passed" % [_results.size() - failed, _results.size()])
	get_tree().quit(1 if failed > 0 else 0)


# ---------------------------------------------------------------- helpers

func _spawn(cfg: Dictionary = {}) -> Main:
	var m: Main = MAIN_SCENE.instantiate()
	var base := {"skip_intro": true, "ai": false, "seed": 5}
	base.merge(cfg, true)
	m.config.merge(base, true)
	get_tree().root.add_child(m)
	main = m
	await _frames(3)
	m.player.landed_hit.connect(func(r: String, _d: float) -> void: _signals.append("landed:" + r))
	m.player.defended.connect(func(k: String) -> void: _signals.append("defended:" + k))
	m.enemy.staggered.connect(func() -> void: _signals.append("staggered"))
	m.enemy.defeated.connect(func() -> void: _signals.append("defeated"))
	m.player.died.connect(func() -> void: _signals.append("player_died"))
	m.enemy.died.connect(func() -> void: _signals.append("enemy_died"))
	return m


func _despawn() -> void:
	for a in ["block", "move_forward", "move_back", "move_left", "move_right"]:
		Input.action_release(a)
	if is_instance_valid(main):
		main.queue_free()
	var cs := get_tree().current_scene
	if cs != null and cs is Main:
		cs.queue_free()
	main = null
	await _frames(3)
	Engine.time_scale = 1.0


func _frames(n: int) -> void:
	for i in n:
		await get_tree().physics_frame


func _seconds(t: float) -> void:
	await _frames(int(ceil(t * 60.0)))


func _send(action: String, pressed: bool) -> void:
	var ev := InputEventAction.new()
	ev.action = action
	ev.pressed = pressed
	ev.strength = 1.0 if pressed else 0.0
	Input.parse_input_event(ev)


func _tap(action: String) -> void:
	_send(action, true)
	await _frames(1)
	_send(action, false)


## Puts the fighters face to face, `dist` metres apart along Z.
func _face_off(dist: float) -> void:
	main.player.global_position = Vector3(0, 0, 3)
	main.player.rotation.y = 0.0
	main.player.velocity = Vector3.ZERO
	main.enemy.global_position = Vector3(0, 0, 3 - dist)
	main.enemy.rotation.y = PI
	main.enemy.velocity = Vector3.ZERO
	await _frames(4)


func _approx(a: float, b: float, eps: float = 0.11) -> bool:
	return absf(a - b) <= eps


# ---------------------------------------------------------------- tests

func test_project_and_input_map() -> Variant:
	var expect := {
		"move_forward": [KEY_W], "move_back": [KEY_S], "move_left": [KEY_A], "move_right": [KEY_D],
		"attack_light": [KEY_J], "attack_heavy": [KEY_K], "dodge": [KEY_SPACE], "block": [KEY_SHIFT], "restart": [KEY_R],
	}
	for action: String in expect:
		if not InputMap.has_action(action):
			return "missing action %s" % action
		var keys := []
		for ev in InputMap.action_get_events(action):
			if ev is InputEventKey:
				keys.append((ev as InputEventKey).physical_keycode)
		for k in expect[action]:
			if not k in keys:
				return "%s lacks key %d" % [action, k]
	var mouse := {"attack_light": MOUSE_BUTTON_LEFT, "attack_heavy": MOUSE_BUTTON_RIGHT}
	for action: String in mouse:
		var found := false
		for ev in InputMap.action_get_events(action):
			if ev is InputEventMouseButton and (ev as InputEventMouseButton).button_index == mouse[action]:
				found = true
		if not found:
			return "%s lacks mouse button" % action
	var renderer := str(ProjectSettings.get_setting("rendering/renderer/rendering_method"))
	return [true, "11 actions bound (WASD, J/LMB, K/RMB, Space, Shift, R); renderer=%s; engine=%s" % [renderer, Engine.get_version_info()["string"]]]


func test_scene_structure() -> Variant:
	await _spawn()
	if not main.player is CharacterBody3D or not main.enemy is CharacterBody3D:
		return "fighters are not CharacterBody3D"
	if not main.camera_rig.cam.current:
		return "camera not current"
	for a in ["idle", "run", "light1", "light2", "light3", "heavy", "roll", "block", "hit", "death", "finisher", "victory"]:
		if not main.player.anim.has_animation(a):
			return "warrior missing animation %s" % a
	for a in ["idle", "walk", "swipe_r", "swipe_l", "slam", "lunge", "flinch", "stagger", "kneel", "doom", "roar"]:
		if not main.enemy.anim.has_animation(a):
			return "creature missing animation %s" % a
	var meshes := main.find_children("*", "MeshInstance3D", true, false).size()
	var particles := main.find_children("*", "CPUParticles3D", true, false).size()
	return [true, "%d meshes, %d particle systems, %d warrior anims, %d creature anims" % [meshes, particles,
			main.player.anim.get_animation_list().size(), main.enemy.anim.get_animation_list().size()]]


func test_light_attack_hits_via_hitbox() -> Variant:
	await _spawn()
	await _face_off(2.1)
	var hp0 := main.enemy.hp
	await _tap("attack_light")
	await _seconds(0.8)
	var dealt := hp0 - main.enemy.hp
	if not _approx(dealt, 18.0):
		return "expected 18 damage, got %.1f (signals %s)" % [dealt, _signals]
	if not "landed:hit" in _signals:
		return "landed_hit signal missing: %s" % [_signals]
	return [true, "creature hp %.0f -> %.0f (axe Area3D overlapped creature hurtbox)" % [hp0, main.enemy.hp]]


func test_attack_out_of_range_misses() -> Variant:
	await _spawn()
	await _face_off(6.5)
	var hp0 := main.enemy.hp
	await _tap("attack_light")
	await _seconds(0.8)
	if main.enemy.hp != hp0:
		return "hit registered from 6.5 m away"
	return [true, "swing at 6.5 m dealt no damage (no distance-only hits)"]


func test_three_hit_combo() -> Variant:
	await _spawn()
	await _face_off(2.1)
	var hp0 := main.enemy.hp
	var seen := []
	await _tap("attack_light")
	for i in 40:
		await _frames(1)
		var a := main.player.current_attack()
		if a != "" and (seen.is_empty() or seen.back() != a):
			seen.append(a)
		if i == 12 or i == 26:
			await _tap("attack_light")
	await _seconds(1.0)
	var dealt := hp0 - main.enemy.hp
	if seen != ["light1", "light2", "light3"]:
		return "combo chain was %s" % [seen]
	if not _approx(dealt, 68.0):
		return "expected 68 combo damage, got %.1f" % dealt
	return [true, "chain %s dealt %.0f" % [seen, dealt]]


func test_heavy_attack_damage_and_poise() -> Variant:
	await _spawn()
	await _face_off(2.2)
	var hp0 := main.enemy.hp
	await _tap("attack_heavy")
	await _seconds(1.3)
	var dealt := hp0 - main.enemy.hp
	if not _approx(dealt, 48.0):
		return "expected 48 heavy damage, got %.1f" % dealt
	if not _approx(main.enemy.poise, 38.0, 2.0):
		return "expected ~38 poise, got %.1f" % main.enemy.poise
	return [true, "heavy dealt %.0f, poise %.0f/100" % [dealt, main.enemy.poise]]


func test_poise_break_staggers() -> Variant:
	await _spawn()
	await _face_off(2.1)
	main.enemy.poise = 94.0
	main.enemy._since_hit = 0.0
	await _tap("attack_light")
	await _seconds(0.7)
	if main.enemy.state != StarEater.State.STAGGER:
		return "creature state %d, expected STAGGER" % main.enemy.state
	if not "staggered" in _signals:
		return "staggered signal missing"
	var hp_before := main.enemy.hp
	await _tap("attack_light")
	await _seconds(0.7)
	var dealt := hp_before - main.enemy.hp
	if not _approx(dealt, 18.0 * 1.3):
		return "staggered damage bonus wrong: %.1f" % dealt
	return [true, "poise broke -> STAGGER; follow-up hit dealt %.1f (x1.3)" % dealt]


func test_creature_swipe_hits_player() -> Variant:
	await _spawn()
	await _face_off(2.4)
	main.enemy.start_attack("swipe_r")
	await _seconds(1.6)
	if not _approx(main.player.hp, 100.0 - 14.0):
		return "player hp %.1f, expected 86" % main.player.hp
	return [true, "blade hitbox struck the player: hp 100 -> %.0f" % main.player.hp]


func test_block_reduces_damage() -> Variant:
	await _spawn()
	await _face_off(2.4)
	_send("block", true)
	await _seconds(0.5)
	main.enemy.start_attack("swipe_r")
	await _seconds(1.6)
	_send("block", false)
	if not _approx(main.player.hp, 100.0 - 14.0 * 0.15):
		return "player hp %.2f, expected %.2f (signals %s)" % [main.player.hp, 100.0 - 2.1, _signals]
	if not "defended:block" in _signals:
		return "block not reported"
	return [true, "blocked swipe: hp 100 -> %.1f (15%% chip)" % main.player.hp]


func test_parry_negates_and_recoils() -> Variant:
	await _spawn()
	await _face_off(2.4)
	main.enemy.start_attack("swipe_r")
	while main.enemy.windup_remaining() > 0.06:
		await _frames(1)
	_send("block", true)
	await _seconds(0.5)
	_send("block", false)
	if main.player.hp != 100.0:
		return "parry still took damage: hp %.1f (signals %s)" % [main.player.hp, _signals]
	if not "defended:parry" in _signals:
		return "parry not reported: %s" % [_signals]
	if not _approx(main.enemy.poise, 45.0, 1.0):
		return "creature poise %.1f, expected 45" % main.enemy.poise
	return [true, "parry: no damage, creature recoiled with %.0f poise" % main.enemy.poise]


func test_dodge_iframes() -> Variant:
	await _spawn()
	await _face_off(2.4)
	# Unit check: a hit arriving mid-roll is ignored.
	_send("dodge", true)
	await _frames(2)
	_send("dodge", false)
	await _frames(4)
	var r: String = main.player.receive_hit({"damage": 50.0, "from": main.enemy.global_position, "point": main.player.global_position})
	if r != "dodged" or main.player.hp != 100.0:
		return "mid-roll hit returned %s, hp %.1f" % [r, main.player.hp]
	await _seconds(0.8)
	# Scenario: roll through a slam.
	await _face_off(2.6)
	main.enemy.start_attack("slam")
	while main.enemy.windup_remaining() > 0.12:
		await _frames(1)
	Input.action_press("move_left")
	_send("dodge", true)
	await _frames(2)
	_send("dodge", false)
	await _seconds(0.4)
	Input.action_release("move_left")
	await _seconds(1.2)
	if main.player.hp != 100.0:
		return "dodged slam still hit: hp %.1f" % main.player.hp
	return [true, "i-frames returned 'dodged'; rolling through a slam took no damage"]


func test_slam_is_unblockable() -> Variant:
	await _spawn()
	await _face_off(2.6)
	_send("block", true)
	await _seconds(0.4)
	main.enemy.start_attack("slam")
	await _seconds(2.0)
	_send("block", false)
	if not _approx(main.player.hp, 100.0 - 24.0):
		return "player hp %.1f, expected 76" % main.player.hp
	return [true, "blocking a red-ring slam still costs full damage: hp %.0f" % main.player.hp]


func test_kill_kneel_finisher_victory() -> Variant:
	await _spawn()
	await _face_off(2.1)
	main.enemy.hp = 10.0
	await _tap("attack_light")
	await _seconds(0.9)
	if main.enemy.state != StarEater.State.KNEEL or not "defeated" in _signals:
		return "creature did not kneel (state %d)" % main.enemy.state
	await _tap("attack_heavy")
	await _seconds(0.3)
	if main.state != Main.GameState.FINISHER:
		return "finisher did not start (state %d)" % main.state
	for i in 360:
		await _frames(1)
		if main.state == Main.GameState.VICTORY:
			break
	if main.state != Main.GameState.VICTORY or main.enemy.state != StarEater.State.DEAD:
		return "no victory (game %d, creature %d)" % [main.state, main.enemy.state]
	return [true, "hp 0 -> KNEEL -> finisher -> creature DEAD -> VICTORY"]


func test_player_death_defeat() -> Variant:
	await _spawn()
	await _face_off(2.4)
	main.player.hp = 10.0
	main.enemy.start_attack("swipe_r")
	await _seconds(1.6)
	if main.player.state != Warrior.State.DEAD or main.state != Main.GameState.DEFEAT:
		return "expected DEFEAT, player state %d game state %d" % [main.player.state, main.state]
	return [true, "lethal swipe -> player DEAD -> DEFEAT screen"]


func test_restart_reloads_fresh() -> Variant:
	await _spawn()
	await _face_off(2.4)
	main.player.hp = 10.0
	main.enemy.start_attack("swipe_r")
	await _seconds(1.6)
	get_tree().current_scene = main
	var old_id := main.get_instance_id()
	_send("restart", true)
	await _frames(2)
	_send("restart", false)
	await _frames(6)
	var cs := get_tree().current_scene
	if cs == null or not cs is Main or cs.get_instance_id() == old_id:
		return "scene was not reloaded"
	var fresh: Main = cs
	main = fresh
	if fresh.player.hp != Warrior.MAX_HP or fresh.enemy.hp != fresh.enemy.max_hp:
		return "reloaded scene not fresh"
	return [true, "R reloaded the scene: player %.0f hp, creature %.0f hp" % [fresh.player.hp, fresh.enemy.hp]]


func test_ai_defeats_passive_player() -> Variant:
	await _spawn({"ai": true})
	var attacks := [0]
	main.enemy.attack_started.connect(func(_a: String, _u: bool) -> void: attacks[0] += 1)
	for i in 60 * 60:
		await _frames(1)
		if main.state == Main.GameState.DEFEAT:
			break
	if main.state != Main.GameState.DEFEAT:
		return "AI did not defeat an idle player in 60 s (hp %.0f, %d attacks)" % [main.player.hp, attacks[0]]
	return [true, "creature AI approached and killed an idle player with %d attacks" % attacks[0]]


func test_demo_pilot_full_fight() -> Variant:
	await _spawn({"demo": true, "skip_intro": false, "ai": true, "hp_scale": 1.0, "seed": 7})
	for i in 60 * 120:
		await _frames(1)
		if main.state == Main.GameState.VICTORY or main.state == Main.GameState.DEFEAT:
			break
	if main.state != Main.GameState.VICTORY:
		return "full-HP demo fight ended in state %d (player hp %.0f, creature hp %.0f)" % [main.state, main.player.hp, main.enemy.hp]
	return [true, "pilot beat the full 600 HP creature in %.1f s game time, %.0f hp left" % [main.clock, main.player.hp]]


func test_touch_button_triggers_attack() -> Variant:
	await _spawn({"touch": "on"})
	await _face_off(2.1)
	var tc := main.touch
	if tc == null or not tc.visible:
		return "touch controls not shown with touch=on"
	var center: Vector2 = tc._buttons[0]["center"]
	var ev := InputEventScreenTouch.new()
	ev.index = 0
	ev.position = center
	ev.pressed = true
	tc._input(ev)
	ev = ev.duplicate()
	ev.pressed = false
	tc._input(ev)
	await _seconds(0.8)
	if main.enemy.hp >= main.enemy.max_hp:
		return "touch LIGHT button did not attack"
	return [true, "tapping on-screen LIGHT at %s dealt %.0f damage" % [center, main.enemy.max_hp - main.enemy.hp]]

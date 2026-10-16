class_name Main
extends Node3D
## Orchestrates the encounter: arena build, intro descent, the fight, the
## finishing attack, victory/defeat and instant restart. Also chooses the
## landscape or portrait (9:16) presentation.
##
## Command-line options (after `--`):
##   --demo               AI pilot plays using the normal input actions
##   --portrait / --landscape   force a layout (default: from window shape)
##   --touch / --no-touch force on-screen controls (default: touchscreen only)
##   --seed=N             RNG seed for the creature's decisions
##   --hp-scale=F         scale the creature's health (demo recording uses 0.45)
##   --no-intro           skip the descent intro
##   --hitboxes           draw hit/hurt boxes
##   --quit-after-end=S   quit S seconds after victory/defeat (for recording)
##   --log                print a timestamped combat event log

enum GameState { INTRO, FIGHT, FINISHER, VICTORY, DEFEAT }

const ENEMY_BASE_HP := 600.0

var config := {
	"demo": false,
	"portrait": "auto",
	"touch": "auto",
	"seed": 7,
	"hp_scale": 1.0,
	"skip_intro": false,
	"ai": true,
	"hitboxes": false,
	"quit_after_end": -1.0,
	"log": false,
}
var state := GameState.INTRO
var clock := 0.0
var portrait := false
var touch_enabled := false

@onready var arena: Arena = $Arena
@onready var player: Warrior = $Warrior
@onready var enemy: StarEater = $StarEater
@onready var camera_rig: CameraRig = $CameraRig
@onready var fx: FX = $FX
@onready var hud: Hud = $HUD
@onready var world_env: WorldEnvironment = $WorldEnvironment
@onready var sun: DirectionalLight3D = $Sun
@onready var rim: DirectionalLight3D = $RimLight
var touch: TouchControls
var pilot: DemoPilot


func _ready() -> void:
	Engine.time_scale = 1.0
	_parse_args()
	seed(int(config["seed"]))
	enemy.rng.seed = int(config["seed"])
	arena.build(world_env, sun, rim)

	player.enemy = enemy
	player.camera_rig = camera_rig
	enemy.target = player
	camera_rig.player = player
	camera_rig.enemy = enemy
	fx.camera_rig = camera_rig
	fx.hud = hud
	fx.title_font = hud.title_font

	player.health_changed.connect(hud.set_player_health)
	enemy.health_changed.connect(hud.set_boss_health)
	enemy.poise_changed.connect(hud.set_boss_poise)
	player.landed_hit.connect(_on_landed_hit)
	player.defended.connect(_on_defended)
	player.finisher_requested.connect(_start_finisher)
	player.died.connect(_on_defeat)
	enemy.staggered.connect(_on_staggered)
	enemy.defeated.connect(_on_enemy_defeated)
	enemy.died.connect(_on_victory)
	enemy.set_max_hp(ENEMY_BASE_HP * float(config["hp_scale"]))
	_connect_log()
	hud.set_player_health(player.hp, Warrior.MAX_HP)

	var want_touch: String = config["touch"]
	touch_enabled = want_touch == "on" or (want_touch == "auto" and DisplayServer.is_touchscreen_available())
	touch = TouchControls.new()
	touch.font = hud.ui_font
	touch.visible = touch_enabled and not bool(config["demo"])
	hud.add_child(touch)
	hud.show_hints = not touch_enabled and not bool(config["demo"])
	hud.touch_mode = touch.visible
	hud.set_portrait(hud.portrait)

	if config["portrait"] == "on" and DisplayServer.get_name() != "headless":
		var win := get_window()
		if win.size.x > win.size.y and not win.mode in [Window.MODE_FULLSCREEN, Window.MODE_EXCLUSIVE_FULLSCREEN]:
			var screen := DisplayServer.screen_get_size()
			var h := int(screen.y * 0.86)
			win.size = Vector2i(int(h * 9.0 / 16.0), h)
			win.move_to_center()
	get_window().size_changed.connect(_update_layout)
	_update_layout()

	if config["hitboxes"]:
		_add_hitbox_debug()
	if config["demo"]:
		pilot = DemoPilot.new()
		pilot.setup(self)
		add_child(pilot)

	if config["skip_intro"]:
		_skip_intro()
	else:
		_run_intro()


func _parse_args() -> void:
	for a: String in OS.get_cmdline_user_args():
		if a == "--demo":
			config["demo"] = true
		elif a == "--portrait":
			config["portrait"] = "on"
		elif a == "--landscape":
			config["portrait"] = "off"
		elif a == "--touch":
			config["touch"] = "on"
		elif a == "--no-touch":
			config["touch"] = "off"
		elif a == "--no-intro":
			config["skip_intro"] = true
		elif a == "--hitboxes":
			config["hitboxes"] = true
		elif a == "--log":
			config["log"] = true
		elif a.begins_with("--seed="):
			config["seed"] = int(a.get_slice("=", 1))
		elif a.begins_with("--hp-scale="):
			config["hp_scale"] = float(a.get_slice("=", 1))
		elif a.begins_with("--quit-after-end="):
			config["quit_after_end"] = float(a.get_slice("=", 1))


func _update_layout() -> void:
	var win := get_window()
	var mode: String = config["portrait"]
	var p := win.size.y > win.size.x
	if mode == "on":
		p = true
	elif mode == "off":
		p = false
	var base := Vector2i(720, 1280) if p else Vector2i(1280, 720)
	if win.content_scale_size != base:
		win.content_scale_size = base
	if p == portrait and hud.portrait == p:
		return
	portrait = p
	camera_rig.set_portrait(p)
	hud.set_portrait(p)
	touch.set_portrait(p)


# ---------------------------------------------------------------- flow

func _run_intro() -> void:
	state = GameState.INTRO
	player.locked = true
	var land := Vector3(0, 0, -3.0)
	enemy.rotation.y = PI
	enemy.begin_intro(land)
	arena.show_beam(land, 0.25)
	hud.set_bars_visible(false, true)
	hud.show_title(1.75)
	Sfx.play("rift", -3.0)
	camera_rig.snap()
	var tw := create_tween()
	tw.tween_interval(0.3)
	tw.tween_property(enemy, "global_position", land, 0.72).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_IN)
	tw.tween_callback(_on_enemy_landed)
	tw.tween_interval(1.05)
	tw.tween_callback(_start_fight)


func _on_enemy_landed() -> void:
	enemy.land_intro()
	var p := enemy.global_position
	fx.shockwave(p, Color(0.4, 1.0, 0.95), 7.0, 0.6)
	fx.shockwave(p, Color(1.0, 0.6, 0.3), 4.5, 0.45)
	fx.dust(p, 40, 7.0)
	fx.burst(p + Vector3.UP * 0.5, Color(0.5, 1.0, 0.95), 60, 9.0, 0.8, 0.08, -10.0)
	fx.impact_light(p + Vector3.UP * 1.5, Color(0.5, 1.0, 1.0), 8.0, 0.5, 14.0)
	fx.shake(0.9)
	fx.flash(Color(0.8, 1.0, 1.0, 0.3), 0.3)
	Sfx.play("boom", 2.0)
	Sfx.play("roar", -1.0, 0.9)
	arena.hide_beam(0.5)
	hud.set_bars_visible(true)


func _start_fight() -> void:
	if state != GameState.INTRO:
		return
	state = GameState.FIGHT
	log_event("FIGHT begins")
	player.locked = false
	if config["ai"]:
		enemy.start_fight()
	else:
		enemy.state = StarEater.State.STALK
	Sfx.start_music()


func _skip_intro() -> void:
	enemy.global_position = Vector3(0, 0, -3.0)
	enemy.rotation.y = PI
	enemy.land_intro()
	hud.set_bars_visible(true)
	camera_rig.snap()
	state = GameState.INTRO
	_start_fight()


func _on_landed_hit(result: String, _damage: float) -> void:
	if result in ["hit", "stagger", "kill"]:
		hud.register_hit()


func _on_defended(kind: String) -> void:
	match kind:
		"parry":
			hud.message("PARRY!", Color(1.0, 0.86, 0.4), 0.45, 70)
		"block":
			hud.message("BLOCKED", Color(0.85, 0.85, 1.0), 0.25, 44)
		"dodge":
			hud.message("EVADED", Color(0.55, 0.95, 1.0), 0.25, 48)


func _on_staggered() -> void:
	hud.message("STAGGERED!", Color(0.75, 0.55, 1.0), 0.6, 64)
	fx.flash(Color(0.7, 0.5, 1.0, 0.25), 0.2)


func _on_enemy_defeated() -> void:
	hud.message("BROKEN!", Color(1.0, 0.5, 0.35), 0.5, 70)
	fx.slowmo(0.45, 0.35)
	var t := "TAP LIGHT  —  FINISH IT" if touch_enabled else "[ K ]  FINISH IT"
	hud.show_prompt(t)


func _start_finisher() -> void:
	if state != GameState.FIGHT or not enemy.can_be_finished():
		return
	state = GameState.FINISHER
	hud.hide_prompt()
	hud.set_letterbox(true)
	hud.set_bars_visible(false)
	Sfx.set_music_volume(-18.0)
	var e_pos := enemy.global_position
	var dir := player.global_position - e_pos
	dir.y = 0.0
	if dir.length() < 0.1:
		dir = enemy.facing()
	dir = dir.normalized()
	var stand := e_pos + dir * 2.15
	stand.y = player.global_position.y
	enemy.rotation.y = atan2(-dir.x, -dir.z)
	player.rotation.y = atan2(dir.x, dir.z)
	player.begin_finisher()
	var tw := create_tween()
	tw.tween_property(player, "global_position", stand, 0.16)
	var side := dir.cross(Vector3.UP).normalized()
	var mid := (stand + e_pos) * 0.5
	var cam_pos: Vector3
	if portrait:
		cam_pos = mid + side * 4.4 + dir * 0.6 + Vector3.UP * 1.3
	else:
		cam_pos = mid + side * 5.2 + dir * 0.8 + Vector3.UP * 1.4
	camera_rig.set_cinematic(cam_pos, mid + Vector3.UP * 1.55, 0.3)
	Sfx.play("whoosh_heavy", -2.0, 0.8)

	await get_tree().create_timer(0.36).timeout
	player.finisher_swing_fx(true)
	fx.slowmo(0.35, 0.42)
	Sfx.play("whoosh_heavy", 0.0, 0.6)
	await get_tree().create_timer(0.24).timeout
	_finisher_impact()
	await get_tree().create_timer(0.3).timeout
	player.finisher_swing_fx(false)
	camera_rig.set_cinematic(mid + side * 6.6 + dir * 1.6 + Vector3.UP * 2.6, e_pos + Vector3.UP * 1.3, 1.6)
	enemy.disintegrate(0.85)


func _finisher_impact() -> void:
	var p := player.axe_head_position()
	var head := enemy.head_position()
	var hit := p.lerp(head, 0.5)
	fx.hit_stop(0.16)
	fx.slowmo(0.3, 0.85)
	fx.flash(Color(1.0, 0.95, 0.85, 0.55), 0.35)
	fx.sparks(hit, Color(1.0, 0.8, 0.4), 60)
	fx.ichor(hit, Vector3.UP + (head - p).normalized(), 70)
	fx.shockwave(Vector3(hit.x, 0.05, hit.z), Color(0.4, 1.0, 0.95), 7.5, 0.7)
	fx.shockwave(Vector3(hit.x, 0.05, hit.z), Color(1.0, 0.7, 0.3), 4.5, 0.5)
	fx.impact_light(hit, Color(1.0, 0.92, 0.8), 6.0, 0.45, 12.0)
	fx.shake(1.0)
	camera_rig.kick_fov(-9.0)
	fx.world_text(hit + Vector3.UP * 0.6, "SLAIN", Color(1.0, 0.82, 0.4), 120)
	Sfx.play("hit_heavy", 2.0, 0.8)
	Sfx.play("boom", 0.0, 1.1)
	Sfx.play("parry", -4.0, 0.7)
	Sfx.play("roar", -2.0, 1.4)
	enemy.begin_doom()


func _on_victory() -> void:
	if state == GameState.DEFEAT:
		return
	state = GameState.VICTORY
	log_event("VICTORY")
	hud.set_letterbox(false)
	hud.show_end(true, touch_enabled)
	player.play_victory()
	camera_rig.clear_cinematic(1.4)
	camera_rig.orbit_mode = true
	fx.embers(player.global_position + Vector3.UP * 0.5, 30)
	Sfx.set_music_volume(-12.0)
	Sfx.play("victory", -2.0)
	_schedule_quit()


func _on_defeat() -> void:
	if state == GameState.VICTORY or state == GameState.DEFEAT:
		return
	state = GameState.DEFEAT
	log_event("DEFEAT")
	enemy.ai_enabled = false
	hud.hide_prompt()
	hud.show_end(false, touch_enabled)
	fx.slowmo(0.4, 0.8)
	Sfx.play("roar", 0.0, 0.8)
	Sfx.stop_music()
	_schedule_quit()


func _schedule_quit() -> void:
	var q: float = config["quit_after_end"]
	if q >= 0.0:
		get_tree().create_timer(q, true, false, true).timeout.connect(func() -> void: get_tree().quit())


func restart() -> void:
	Engine.time_scale = 1.0
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
	get_tree().reload_current_scene()


func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("restart"):
		restart()
		return
	if (state == GameState.VICTORY or state == GameState.DEFEAT) and event is InputEventScreenTouch and (event as InputEventScreenTouch).pressed:
		restart()
		return
	if touch_enabled or config["demo"]:
		return
	if event is InputEventMouseButton and (event as InputEventMouseButton).pressed and Input.mouse_mode != Input.MOUSE_MODE_CAPTURED:
		Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
	elif event.is_action_pressed("ui_cancel"):
		Input.mouse_mode = Input.MOUSE_MODE_VISIBLE


# ---------------------------------------------------------------- debug

func _physics_process(delta: float) -> void:
	clock += delta


func _exit_tree() -> void:
	Engine.time_scale = 1.0
	Build.clear_caches()


func log_event(msg: String) -> void:
	if config["log"]:
		print("[t=%6.2fs frame=%4d] %s" % [clock, Engine.get_process_frames(), msg])


func _connect_log() -> void:
	if not config["log"]:
		return
	enemy.attack_started.connect(func(a: String, u: bool) -> void:
		log_event("creature attack %s (%s) dist=%.2f" % [a, "unblockable" if u else "parryable", player.global_position.distance_to(enemy.global_position)]))
	player.landed_hit.connect(func(r: String, d: float) -> void:
		log_event("player hit -> %s dmg=%.0f creature hp=%.0f/%.0f poise=%.0f" % [r, d, enemy.hp, enemy.max_hp, enemy.poise]))
	player.defended.connect(func(k: String) -> void: log_event("player defended: %s" % k))
	player.health_changed.connect(func(c: float, m: float) -> void: log_event("player hp %.1f/%.0f" % [c, m]))
	enemy.staggered.connect(func() -> void: log_event("creature STAGGERED"))
	enemy.defeated.connect(func() -> void: log_event("creature BROKEN (kneeling, finisher available)"))
	player.finisher_requested.connect(func() -> void: log_event("finisher requested"))
	enemy.died.connect(func() -> void: log_event("creature died"))
	player.died.connect(func() -> void: log_event("player died"))

func _add_hitbox_debug() -> void:
	for root: Node in [player, enemy]:
		for area: Area3D in root.find_children("*", "Area3D", true, false):
			var weapon := area.collision_layer == 0
			var m := StandardMaterial3D.new()
			m.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
			m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
			m.albedo_color = Color(1, 0.1, 0.1, 0.35) if weapon else Color(0.1, 1, 0.3, 0.22)
			m.cull_mode = BaseMaterial3D.CULL_DISABLED
			for cs: CollisionShape3D in area.find_children("*", "CollisionShape3D", false, false):
				var mesh: Mesh = null
				if cs.shape is BoxShape3D:
					mesh = Build.box((cs.shape as BoxShape3D).size.x, (cs.shape as BoxShape3D).size.y, (cs.shape as BoxShape3D).size.z)
				elif cs.shape is CapsuleShape3D:
					mesh = Build.capsule((cs.shape as CapsuleShape3D).radius, (cs.shape as CapsuleShape3D).height)
				elif cs.shape is SphereShape3D:
					mesh = Build.ball((cs.shape as SphereShape3D).radius)
				if mesh:
					var mi := MeshInstance3D.new()
					mi.mesh = mesh
					mi.material_override = m
					mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
					cs.add_child(mi)

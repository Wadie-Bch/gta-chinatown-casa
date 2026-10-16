extends Node3D
## AMAZIGH SAGA: THE LAST STAR — portrait (9:16) reel trailer director.
##
## Everything on screen is rendered by Godot from this project's own assets:
## - Cinematic shots stage the arena, warrior and creature models in a dedicated
##   world, driven frame-by-frame by this director (cameras, poses, effects).
## - Combat shots are the real game (scenes/main.tscn) running inside a
##   SubViewport, played by the input-driven demo pilot. Hits, parries,
##   staggers and the finisher come from the actual combat code.
## The timeline is locked to the frame counter, so a Movie Maker render is
## deterministic. Run:  godot --path . res://scenes/trailer.tscn -- [--log] [--t0=S]

const FPS := 30.0
const DURATION := 42.0
const GAME_SCENE := preload("res://scenes/main.tscn")
const WARRIOR_SCENE := preload("res://scenes/warrior.tscn")
const ALIEN_SCENE := preload("res://scenes/star_eater.tscn")

## Gameplay window: the fight runs live from T_GAME_START, is frozen while the
## cinematic Star Eater sequence plays, then resumes for the finisher.
const T_GAME_START := 12.0
const T_GAME_PAUSE := 20.0
const T_GAME_RESUME := 33.6
const T_BLACK := 37.3
const T_TITLE := 37.6

var frame := 0
var t := 0.0
var log_enabled := false
var no_music := false
## Preview mode: each rendered frame jumps to the next listed time (cinematic shots only).
var preview_times: Array = []
var shots: Array = []
var _shot_i := -1
var _shot_first := false

# Cinematic world
var cine: Node3D
var cine_env: Environment
var sun: DirectionalLight3D
var rim: DirectionalLight3D
var arena: Arena
var cine_fx: FX
var cam: Camera3D
var hero: Warrior
var invaders: Array[StarEater] = []
var colossus: StarEater
var harbinger: Node3D
var _harb_body: ShaderMaterial
var _harb_corona: ShaderMaterial
var _harb_shards: Node3D
var sky_mat: ShaderMaterial
var edge_mat: StandardMaterial3D
var _actors_anim: Array = []
var _colossus_fx: Array[CPUParticles3D] = []
var _cosmic: CPUParticles3D
var _rift_mat: ShaderMaterial
var _title_backdrop: TextureRect
var _roared := false
var _muted := false

# Gameplay
var game_vp: SubViewport
var game_box: SubViewportContainer
var game: Main
var game_cam: Camera3D
var game_running := false

# Overlay
var grade_mat: ShaderMaterial
var flash_rect: ColorRect
var tag: Label
var _captions: Array = []
var _title_nodes: Array = []
var _title_ornament: Control
var _flashes: Array = []
var _cues: Array = []
var _cue_i := 0
var music: AudioStreamPlayer
var _music_started := false
var _preview_i := 0
var _corona: MeshInstance3D

# Camera shake
var _trauma := 0.0
var _noise := FastNoiseLite.new()

var cinzel: FontFile


func _ready() -> void:
	Engine.time_scale = 1.0
	get_window().content_scale_size = Vector2i(720, 1280)
	for a: String in OS.get_cmdline_user_args():
		if a == "--log":
			log_enabled = true
		elif a.begins_with("--t0="):
			frame = int(float(a.get_slice("=", 1)) * FPS)
		elif a == "--no-music":
			no_music = true
		elif a.begins_with("--preview="):
			no_music = true
			for v in a.get_slice("=", 1).split(","):
				preview_times.append(float(v))
	_noise.seed = 11
	_noise.frequency = 1.3
	cinzel = load("res://assets/fonts/Cinzel-Variable.ttf")
	_setup_audio()
	_build_cine_world()
	_build_game()
	_build_overlay()
	_build_shots()
	_build_cues()
	if frame > 0:
		# Preview from a later point: skip cues and treat earlier shots as done.
		t = frame / FPS
		while _cue_i < _cues.size() and float(_cues[_cue_i][0]) < t:
			_cue_i += 1
	_log("trailer ready, %d shots" % shots.size())


func _log(msg: String) -> void:
	if log_enabled:
		print("[trailer t=%6.2fs frame=%4d] %s" % [t, frame, msg])


# ================================================================ audio

func _setup_audio() -> void:
	var music_bus := AudioServer.bus_count
	AudioServer.add_bus(music_bus)
	AudioServer.set_bus_name(music_bus, "Music")
	AudioServer.set_bus_send(music_bus, "Master")
	AudioServer.set_bus_volume_db(music_bus, 0.0)
	var sfx_bus := AudioServer.bus_count
	AudioServer.add_bus(sfx_bus)
	AudioServer.set_bus_name(sfx_bus, "SFX")
	AudioServer.set_bus_send(sfx_bus, "Master")
	AudioServer.set_bus_volume_db(sfx_bus, -1.0)
	var verb := AudioEffectReverb.new()
	verb.room_size = 0.75
	verb.damping = 0.45
	verb.spread = 0.9
	verb.wet = 0.22
	verb.dry = 0.92
	AudioServer.add_bus_effect(music_bus, verb)
	# Duck the score whenever combat/impact effects play.
	var duck := AudioEffectCompressor.new()
	duck.threshold = -14.0
	duck.ratio = 2.0
	duck.attack_us = 4000.0
	duck.release_ms = 140.0
	duck.sidechain = &"SFX"
	AudioServer.add_bus_effect(music_bus, duck)
	var sverb := AudioEffectReverb.new()
	sverb.room_size = 0.5
	sverb.wet = 0.12
	sverb.dry = 1.0
	AudioServer.add_bus_effect(sfx_bus, sverb)
	var shelf := AudioEffectHighPassFilter.new()
	shelf.cutoff_hz = 38.0
	AudioServer.add_bus_effect(0, shelf, 0)
	Sfx.set_bus("SFX")
	music = AudioStreamPlayer.new()
	music.bus = &"Music"
	add_child(music)
	if no_music:
		return
	# The score is synthesised in memory on every run (about 20 s), so the render
	# always uses the exact samples and never an imported/re-compressed copy.
	var t_start := Time.get_ticks_msec()
	music.stream = TrailerScore.build()
	print("trailer score synthesised in %d ms" % (Time.get_ticks_msec() - t_start))


# ================================================================ cinematic world

func _build_cine_world() -> void:
	cine = Node3D.new()
	cine.name = "CineWorld"
	add_child(cine)
	var we := WorldEnvironment.new()
	cine.add_child(we)
	sun = DirectionalLight3D.new()
	cine.add_child(sun)
	rim = DirectionalLight3D.new()
	cine.add_child(rim)
	arena = Arena.new()
	arena.name = "Arena"
	cine.add_child(arena)
	arena.build(we, sun, rim)
	cine_env = we.environment
	sky_mat = cine_env.sky.sky_material
	# Lower, warmer sunset sun for the trailer.
	sun.global_transform = Transform3D(Basis.looking_at(Vector3(-0.5, -0.2, -0.84).normalized(), Vector3.UP), Vector3.ZERO)
	sun.directional_shadow_max_distance = 60.0
	_rift_mat = (arena.get_node("StarRift") as MeshInstance3D).material_override

	cine_fx = FX.new()
	cine_fx.drives_time = false
	cine.add_child(cine_fx)

	cam = Camera3D.new()
	cam.keep_aspect = Camera3D.KEEP_HEIGHT
	cam.near = 0.1
	cam.far = 1500.0
	cine.add_child(cam)
	cam.current = true

	hero = WARRIOR_SCENE.instantiate()
	cine.add_child(hero)
	hero.global_position = Vector3(0, 0, 5)
	hero.locked = true
	hero.state = Warrior.State.CINEMATIC
	hero.cine_driven = true
	hero.collision_layer = 0
	hero.collision_mask = 0
	_manual_anim(hero.anim)
	var edge_node := hero.find_child("Edge", true, false) as MeshInstance3D
	edge_mat = (edge_node.material_override as StandardMaterial3D).duplicate()
	edge_mat.emission_enabled = true
	edge_mat.emission = Color(0.35, 1.0, 0.95)
	edge_mat.emission_energy_multiplier = 0.0
	edge_node.material_override = edge_mat

	for i in 3:
		var a: StarEater = ALIEN_SCENE.instantiate()
		cine.add_child(a)
		a.collision_layer = 0
		a.collision_mask = 0
		a.rig.scale = Vector3.ONE * 0.9
		a._comet.mesh = FX.quad_of(1.6)
		a.visible = false
		_manual_anim(a.anim)
		invaders.append(a)

	colossus = ALIEN_SCENE.instantiate()
	cine.add_child(colossus)
	colossus.collision_layer = 0
	colossus.collision_mask = 0
	colossus.rig.scale = Vector3.ONE * 12.0
	colossus._glow_energy = 2.0
	colossus.global_position = Vector3(0, -44, -72)
	colossus.rotation.y = PI
	colossus.visible = false
	_manual_anim(colossus.anim)
	_build_colossus_identity()
	_build_colossus_fx()
	_build_harbinger()
	_build_ruin_fires()

	_cosmic = CPUParticles3D.new()
	_cosmic.amount = 18
	_cosmic.lifetime = 0.7
	_cosmic.mesh = FX.quad_of(0.035)
	_cosmic.material_override = Build.fx(Color.WHITE)
	_cosmic.emission_shape = CPUParticles3D.EMISSION_SHAPE_SPHERE
	_cosmic.emission_sphere_radius = 0.25
	_cosmic.direction = Vector3.UP
	_cosmic.spread = 180.0
	_cosmic.initial_velocity_min = 0.3
	_cosmic.initial_velocity_max = 1.2
	_cosmic.gravity = Vector3(0, 0.6, 0)
	var cg := Gradient.new()
	cg.set_color(0, Color(0.6, 1.3, 1.3, 1))
	cg.set_color(1, Color(0.6, 0.3, 1.2, 0))
	_cosmic.color_ramp = cg
	_cosmic.emitting = false
	_cosmic.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	cine.add_child(_cosmic)


func _manual_anim(ap: AnimationPlayer) -> void:
	ap.callback_mode_process = AnimationMixer.ANIMATION_CALLBACK_MODE_PROCESS_MANUAL
	_actors_anim.append([ap, 1.0])


func _set_anim_speed(ap: AnimationPlayer, speed: float) -> void:
	for e: Array in _actors_anim:
		if e[0] == ap:
			e[1] = speed


func _pose(actor: Node, anim_name: String, at: float = 0.0, speed: float = 1.0, blend: float = 0.0) -> void:
	var ap: AnimationPlayer = actor.get("anim")
	ap.play(anim_name, blend)
	ap.seek(at, true)
	_set_anim_speed(ap, speed)


func _build_harbinger() -> void:
	harbinger = Node3D.new()
	harbinger.name = "Harbinger"
	cine.add_child(harbinger)
	harbinger.position = Vector3(-70, -120, -520)
	_harb_body = ShaderMaterial.new()
	_harb_body.shader = preload("res://shaders/harbinger.gdshader")
	var body := Build.part(harbinger, Build.ball(58.0, 48, 24), _harb_body)
	body.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	_harb_corona = ShaderMaterial.new()
	_harb_corona.shader = preload("res://shaders/corona.gdshader")
	var q := QuadMesh.new()
	q.size = Vector2(330, 330)
	_corona = Build.part(harbinger, q, _harb_corona)
	_corona.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	_harb_shards = Node3D.new()
	harbinger.add_child(_harb_shards)
	var shard_mat := ShaderMaterial.new()
	shard_mat.shader = preload("res://shaders/harbinger.gdshader")
	shard_mat.set_shader_parameter("rim_power", 1.6)
	shard_mat.set_shader_parameter("seam_glow", 0.0)
	for i in 7:
		var a := TAU * i / 7.0
		var s := Build.part(_harb_shards, Build.prism(9.0, 60.0, 9.0), shard_mat,
				Vector3(cos(a) * 92.0, sin(a * 2.0) * 12.0, sin(a) * 92.0), Vector3(0, -rad_to_deg(a), 18.0 + 10.0 * sin(a * 3.0)))
		s.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	_harb_shards.rotation_degrees = Vector3(14, 0, -10)


## The colossal Star Eater gets its own silhouette: a crown of black-star shards
## and a black-star heart echoing the harbinger.
func _build_colossus_identity() -> void:
	var crown_mat := ShaderMaterial.new()
	crown_mat.shader = preload("res://shaders/harbinger.gdshader")
	crown_mat.set_shader_parameter("rim_power", 1.5)
	crown_mat.set_shader_parameter("seam_glow", 0.0)
	var head: Node3D = colossus.joints["head"]
	for i in 7:
		var a := lerpf(-1.2, 1.2, float(i) / 6.0)
		var slen := 0.75 + 0.35 * cos(a * 1.3)
		var spike := Build.part(head, Build.cyl(0.0, 0.07, slen, 5), crown_mat,
				Vector3(sin(a) * 0.26, 0.3 + 0.05 * cos(a), 0.12),
				Vector3(-35.0 + 10.0 * cos(a), 0, -rad_to_deg(a) * 0.9))
		spike.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	var heart_mat := ShaderMaterial.new()
	heart_mat.shader = preload("res://shaders/harbinger.gdshader")
	heart_mat.set_shader_parameter("rim_power", 2.2)
	var spine: Node3D = colossus.joints["spine"]
	Build.part(spine, Build.ball(0.2, 16, 10), heart_mat, Vector3(0, 0.74, -0.6))


func _build_colossus_fx() -> void:
	# Low violet clouds around the colossus' waist for scale.
	var clouds := CPUParticles3D.new()
	clouds.amount = 22
	clouds.lifetime = 12.0
	clouds.preprocess = 12.0
	clouds.mesh = FX.quad_of(26.0)
	var cm := Build.fx(Color(1, 1, 1, 0.42), false, true)
	cm.distance_fade_mode = BaseMaterial3D.DISTANCE_FADE_PIXEL_ALPHA
	cm.distance_fade_min_distance = 8.0
	cm.distance_fade_max_distance = 30.0
	clouds.material_override = cm
	clouds.emission_shape = CPUParticles3D.EMISSION_SHAPE_BOX
	clouds.emission_box_extents = Vector3(42, 4, 14)
	clouds.direction = Vector3(1, 0, 0.2)
	clouds.spread = 20.0
	clouds.initial_velocity_min = 0.6
	clouds.initial_velocity_max = 1.4
	clouds.gravity = Vector3.ZERO
	var g := Gradient.new()
	g.set_color(0, Color(0.42, 0.33, 0.52, 0.0))
	g.set_color(1, Color(0.42, 0.33, 0.52, 0.0))
	g.add_point(0.25, Color(0.45, 0.35, 0.55, 0.7))
	g.add_point(0.75, Color(0.4, 0.3, 0.5, 0.6))
	clouds.color_ramp = g
	clouds.position = Vector3(0, 17, -64)
	clouds.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	clouds.visible = false
	cine.add_child(clouds)
	_colossus_fx.append(clouds)
	# Falling debris from its shoulders (real meshes, so scale applies).
	for side: int in [1, -1]:
		var d := CPUParticles3D.new()
		d.amount = 26
		d.lifetime = 2.6
		d.mesh = Build.box(0.9, 0.7, 0.8)
		d.material_override = Build.mat(Color(0.5, 0.36, 0.26), 0.95)
		d.emission_shape = CPUParticles3D.EMISSION_SHAPE_BOX
		d.emission_box_extents = Vector3(3, 1, 2)
		d.direction = Vector3(side * 0.4, 0.3, 0.3)
		d.spread = 35.0
		d.initial_velocity_min = 1.0
		d.initial_velocity_max = 4.0
		d.gravity = Vector3(0, -12, 0)
		d.angular_velocity_min = -200.0
		d.angular_velocity_max = 200.0
		d.scale_amount_min = 0.5
		d.scale_amount_max = 1.6
		d.emitting = false
		d.visible = false
		cine.add_child(d)
		_colossus_fx.append(d)
	# Dust boiling up at its base.
	var dust := CPUParticles3D.new()
	dust.amount = 40
	dust.lifetime = 3.5
	dust.mesh = FX.quad_of(9.0)
	dust.material_override = Build.fx(Color(1, 1, 1, 0.5), false, true)
	dust.emission_shape = CPUParticles3D.EMISSION_SHAPE_BOX
	dust.emission_box_extents = Vector3(16, 1, 8)
	dust.direction = Vector3.UP
	dust.spread = 30.0
	dust.initial_velocity_min = 2.0
	dust.initial_velocity_max = 5.0
	dust.gravity = Vector3(0, -0.5, 0)
	var dg := Gradient.new()
	dg.set_color(0, Color(0.62, 0.47, 0.34, 0.7))
	dg.set_color(1, Color(0.5, 0.4, 0.32, 0.0))
	dust.color_ramp = dg
	dust.position = Vector3(0, 5, -64)
	dust.emitting = false
	dust.visible = false
	dust.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	cine.add_child(dust)
	_colossus_fx.append(dust)


func _build_ruin_fires() -> void:
	# The destroyed settlement: kasbah towers burning, smoke drifting with the wind.
	var towers := [Vector3(-15, 11.5, -33), Vector3(14, 12.5, -35), Vector3(-31, 10.5, -15), Vector3(32, 11, -20)]
	var ti := 0
	for p: Vector3 in towers:
		var big := ti == 0
		ti += 1
		var smoke := CPUParticles3D.new()
		smoke.amount = 24
		smoke.lifetime = 7.0
		smoke.preprocess = 7.0
		smoke.mesh = FX.quad_of(6.5)
		smoke.material_override = Build.fx(Color(1, 1, 1, 0.55), false, true)
		smoke.emission_shape = CPUParticles3D.EMISSION_SHAPE_SPHERE
		smoke.emission_sphere_radius = 1.2
		smoke.direction = Vector3.UP
		smoke.spread = 12.0
		smoke.initial_velocity_min = 1.6
		smoke.initial_velocity_max = 2.6
		smoke.gravity = Vector3(0.7, 0.3, 0.2)
		var sg := Gradient.new()
		sg.set_color(0, Color(0.22, 0.17, 0.15, 0.0))
		sg.set_color(1, Color(0.25, 0.22, 0.24, 0.0))
		sg.add_point(0.15, Color(0.2, 0.15, 0.13, 0.75))
		sg.add_point(0.6, Color(0.24, 0.2, 0.22, 0.45))
		smoke.color_ramp = sg
		smoke.position = p + Vector3(0, 1.0, 0)
		smoke.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		cine.add_child(smoke)
		var fire := CPUParticles3D.new()
		fire.amount = 44 if big else 26
		fire.lifetime = 0.9
		fire.preprocess = 1.0
		fire.mesh = FX.quad_of(3.4 if big else 2.0)
		fire.material_override = Build.fx(Color.WHITE)
		fire.emission_shape = CPUParticles3D.EMISSION_SHAPE_SPHERE
		fire.emission_sphere_radius = 1.4
		fire.direction = Vector3.UP
		fire.spread = 15.0
		fire.initial_velocity_min = 1.5
		fire.initial_velocity_max = 3.5
		fire.gravity = Vector3(0, 1.5, 0)
		var fg := Gradient.new()
		fg.set_color(0, Color(1.5, 0.9, 0.35, 0.9))
		fg.set_color(1, Color(0.5, 0.1, 0.02, 0.0))
		fg.add_point(0.4, Color(1.3, 0.45, 0.1, 0.7))
		fire.color_ramp = fg
		fire.position = p
		fire.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		cine.add_child(fire)
		var l := OmniLight3D.new()
		l.light_color = Color(1.0, 0.5, 0.2)
		l.light_energy = 6.0 if big else 3.0
		l.omni_range = 18.0
		l.position = p + Vector3(0, 1, 0)
		cine.add_child(l)


# ================================================================ embedded game

func _build_game() -> void:
	var layer := CanvasLayer.new()
	layer.layer = 1
	add_child(layer)
	game_box = SubViewportContainer.new()
	game_box.stretch = false
	game_box.position = Vector2.ZERO
	game_box.size = Vector2(720, 1280)
	game_box.mouse_filter = Control.MOUSE_FILTER_IGNORE
	game_box.visible = false
	layer.add_child(game_box)
	game_vp = SubViewport.new()
	game_vp.size = Vector2i(720, 1280)
	game_vp.own_world_3d = true
	game_vp.msaa_3d = Viewport.MSAA_2X
	game_vp.render_target_update_mode = SubViewport.UPDATE_DISABLED
	game_vp.audio_listener_enable_3d = false
	game_box.add_child(game_vp)
	game = GAME_SCENE.instantiate()
	game.config.merge({
		"demo": true, "skip_intro": true, "seed": 33, "hp_scale": 0.45, "portrait": "on",
		"touch": "off", "embedded": true, "trailer": true, "log": log_enabled,
	}, true)
	game.process_mode = Node.PROCESS_MODE_DISABLED
	game_vp.add_child(game)
	# Same dusk as the cinematic world, so cuts between them stay cohesive.
	var genv: Environment = game.world_env.environment
	var gsky := genv.sky.sky_material as ShaderMaterial
	gsky.set_shader_parameter("darkness", 0.62)
	gsky.set_shader_parameter("star_fade", 1.0)
	genv.fog_density = 0.0028
	genv.fog_light_color = Color(0.5, 0.38, 0.52)
	genv.ambient_light_energy = 0.45
	game.sun.global_transform = sun.global_transform
	game.sun.light_energy = 0.95
	game.sun.directional_shadow_max_distance = 60.0
	game.rim.light_energy = 1.1
	game_cam = Camera3D.new()
	game_cam.keep_aspect = Camera3D.KEEP_HEIGHT
	game_cam.near = 0.1
	game_cam.far = 700.0
	game_vp.add_child(game_cam)
	game.player.landed_hit.connect(func(r: String, d: float) -> void:
		_log("GAME player hit -> %s (%.0f)" % [r, d])
		if r != "ignored":
			_trauma = minf(_trauma + (0.35 if d >= 30.0 else 0.2), 1.0))
	game.player.defended.connect(func(k: String) -> void: _log("GAME defended %s" % k))
	game.enemy.staggered.connect(func() -> void: _log("GAME creature staggered"))
	game.enemy.defeated.connect(func() -> void: _log("GAME creature broken"))
	game.player.finisher_requested.connect(func() -> void: _log("GAME finisher"))
	game.player.health_changed.connect(func(c: float, _m: float) -> void: _log("GAME player hp %.0f" % c))


func _set_game_running(on: bool) -> void:
	if on == game_running:
		return
	game_running = on
	game.process_mode = Node.PROCESS_MODE_INHERIT if on else Node.PROCESS_MODE_DISABLED
	if not on:
		Engine.time_scale = 1.0
	_log("game %s" % ("RUNNING" if on else "PAUSED"))


func _show_game(on: bool) -> void:
	game_box.visible = on
	game_vp.render_target_update_mode = SubViewport.UPDATE_ALWAYS if on else SubViewport.UPDATE_DISABLED
	cine.visible = not on


func _game_mid() -> Vector3:
	return (game.player.global_position + game.enemy.global_position) * 0.5


func _game_axis() -> Array:
	var d := game.enemy.global_position - game.player.global_position
	d.y = 0.0
	if d.length() < 0.1:
		d = Vector3(0, 0, -1)
	d = d.normalized()
	return [d, d.cross(Vector3.UP).normalized()]


func _place_game_cam(pos: Vector3, look: Vector3, fov: float, smooth: float) -> void:
	var sh := _shake_offset()
	if smooth >= 1.0 or _shot_first:
		game_cam.global_position = pos
	else:
		game_cam.global_position = game_cam.global_position.lerp(pos, smooth)
	game_cam.global_position += sh
	game_cam.look_at(look + sh * 0.5, Vector3.UP)
	game_cam.fov = fov
	game_cam.current = true


# ================================================================ overlay

func _build_overlay() -> void:
	var layer := CanvasLayer.new()
	layer.layer = 10
	add_child(layer)
	var root := Control.new()
	root.set_anchors_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	layer.add_child(root)
	var grade := ColorRect.new()
	grade.set_anchors_preset(Control.PRESET_FULL_RECT)
	grade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	grade_mat = ShaderMaterial.new()
	grade_mat.shader = preload("res://shaders/grade.gdshader")
	grade.material = grade_mat
	root.add_child(grade)
	flash_rect = ColorRect.new()
	flash_rect.set_anchors_preset(Control.PRESET_FULL_RECT)
	flash_rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	flash_rect.color = Color(1, 1, 1, 0)
	root.add_child(flash_rect)

	tag = _make_label(root, 17, Color(1, 1, 1, 0.9), 0, 3)
	tag.label_settings.shadow_size = 0
	var pill := StyleBoxFlat.new()
	pill.bg_color = Color(0.02, 0.02, 0.05, 0.5)
	pill.set_corner_radius_all(14)
	pill.content_margin_left = 16
	pill.content_margin_right = 16
	pill.content_margin_top = 5
	pill.content_margin_bottom = 5
	tag.add_theme_stylebox_override("normal", pill)

	# Captions: [t0, t1, text, size, color, y]
	var caps := [
		[0.9, 3.45, "THE STARS ARE\nGOING OUT", 44, Color(0.86, 0.92, 1.0), 0.30],
		[4.7, 6.15, "AMASTAN", 92, Color(1.0, 0.84, 0.5), 0.70],
		[4.95, 6.15, "LAST GUARDIAN OF THE ATLAS", 25, Color(0.95, 0.9, 0.82), 0.775],
		[7.85, 8.6, "THEY TOOK EVERYTHING", 42, Color(1.0, 0.86, 0.7), 0.30],
		[8.8, 9.95, "ONLY VENGEANCE\nREMAINS", 44, Color(1.0, 0.84, 0.5), 0.74],
		[10.15, 11.75, "THE INVASION\nHAS BEGUN", 44, Color(0.75, 1.0, 0.96), 0.24],
		[21.3, 23.1, "THE STAR EATER", 60, Color(0.7, 1.0, 0.96), 0.73],
		[24.2, 25.9, "IT HUNTS THE POWER\nSEALED BENEATH THE ATLAS", 36, Color(0.92, 0.9, 1.0), 0.80],
		[27.75, 28.95, "HIS BLADE BURNS\nWITH THE SAME LIGHT", 38, Color(0.7, 1.0, 0.96), 0.24],
	]
	for c: Array in caps:
		var y := 1280.0 * float(c[5])
		var back := _backdrop(root, y - 95.0, 190.0)
		var l := _make_label(root, int(c[3]), c[4], 14 if int(c[3]) > 60 else 10, 3)
		l.text = c[2]
		_fit_label(l, 600.0, 4)
		l.size = Vector2(720, 200)
		l.position = Vector2(0, y - 100.0)
		l.pivot_offset = l.size * 0.5
		l.modulate.a = 0.0
		_captions.append([float(c[0]), float(c[1]), l, back])

	_title_backdrop = _backdrop(root, 200.0, 380.0)
	_title_backdrop.modulate.a = 0.0
	var title := _make_label(root, 60, Color(1.0, 0.85, 0.5), 14, 5)
	title.text = "AMAZIGH SAGA"
	title.size = Vector2(720, 120)
	title.position = Vector2(0, 250)
	var orn := Control.new()
	orn.mouse_filter = Control.MOUSE_FILTER_IGNORE
	orn.position = Vector2(110, 372)
	orn.size = Vector2(500, 30)
	orn.draw.connect(_draw_ornament.bind(orn))
	root.add_child(orn)
	_title_ornament = orn
	var sub := _make_label(root, 44, Color(0.78, 1.0, 0.97), 11, 8)
	sub.text = "THE LAST STAR"
	sub.size = Vector2(720, 90)
	sub.position = Vector2(0, 404)
	var tagline := _make_label(root, 23, Color(1, 0.95, 0.88, 0.95), 6, 4)
	tagline.text = "AN ORIGINAL DARK-FANTASY SAGA"
	tagline.size = Vector2(720, 30)
	tagline.position = Vector2(0, 500)
	_title_nodes = [title, orn, sub, tagline]
	for n: CanvasItem in _title_nodes:
		n.modulate.a = 0.0
	for n: Control in [title, sub, tagline]:
		n.pivot_offset = n.size * 0.5


## Soft dark band behind on-screen text for legibility over busy frames.
func _backdrop(parent: Control, y: float, h: float) -> TextureRect:
	var g := Gradient.new()
	g.set_color(0, Color(0, 0, 0, 0))
	g.set_color(1, Color(0, 0, 0, 0))
	g.add_point(0.5, Color(0.02, 0.01, 0.04, 0.5))
	var tex := GradientTexture2D.new()
	tex.gradient = g
	tex.fill_from = Vector2(0, 0)
	tex.fill_to = Vector2(0, 1)
	tex.width = 8
	tex.height = 64
	var r := TextureRect.new()
	r.texture = tex
	r.stretch_mode = TextureRect.STRETCH_SCALE
	r.position = Vector2(0, y)
	r.size = Vector2(720, h)
	r.mouse_filter = Control.MOUSE_FILTER_IGNORE
	r.modulate.a = 0.0
	parent.add_child(r)
	return r


## Shrinks the font until the widest line fits max_w at the given letter spacing.
func _fit_label(l: Label, max_w: float, spacing: int) -> void:
	var fv := l.label_settings.font as FontVariation
	var keep := fv.spacing_glyph
	fv.spacing_glyph = spacing
	var fs := l.label_settings.font_size
	while fs > 18:
		var w := fv.get_multiline_string_size(l.text, HORIZONTAL_ALIGNMENT_CENTER, -1, fs).x
		if w * 1.03 <= max_w:
			break
		fs -= 2
	l.label_settings.font_size = fs
	fv.spacing_glyph = keep


func _set_tag(text: String) -> void:
	tag.visible = true
	if tag.text == text:
		return
	tag.text = text
	tag.reset_size()
	tag.position = Vector2((720.0 - tag.size.x) * 0.5, 172.0)


func _make_label(parent: Control, size: int, color: Color, outline: int, spacing: int) -> Label:
	var l := Label.new()
	var fv := FontVariation.new()
	fv.base_font = cinzel
	fv.variation_opentype = {TextServerManager.get_primary_interface().name_to_tag("wght"): 800 if size > 30 else 700}
	fv.spacing_glyph = spacing
	var s := LabelSettings.new()
	s.font = fv
	s.font_size = size
	s.font_color = color
	s.outline_size = outline
	s.outline_color = Color(0.03, 0.02, 0.03, 0.9)
	s.shadow_size = 10
	s.shadow_color = Color(0, 0, 0, 0.55)
	s.shadow_offset = Vector2(0, 4)
	s.line_spacing = -4
	l.label_settings = s
	l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	l.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	l.mouse_filter = Control.MOUSE_FILTER_IGNORE
	parent.add_child(l)
	return l


func _draw_ornament(c: Control) -> void:
	var w := c.size.x
	var h := c.size.y
	var gold := Color(0.95, 0.74, 0.38)
	var pts := PackedVector2Array()
	for i in 21:
		pts.append(Vector2(w * float(i) / 20.0, h * (0.25 if i % 2 == 0 else 0.75)))
	c.draw_polyline(pts, gold, 3.0, true)
	var m := Vector2(w * 0.5, h * 0.5)
	var r := h * 0.95
	c.draw_colored_polygon(PackedVector2Array([m + Vector2(0, -r), m + Vector2(r, 0), m + Vector2(0, r), m + Vector2(-r, 0)]), Color(0.06, 0.1, 0.32))
	c.draw_polyline(PackedVector2Array([m + Vector2(0, -r), m + Vector2(r, 0), m + Vector2(0, r), m + Vector2(-r, 0), m + Vector2(0, -r)]), gold, 3.0, true)
	var r2 := r * 0.42
	c.draw_colored_polygon(PackedVector2Array([m + Vector2(0, -r2), m + Vector2(r2, 0), m + Vector2(0, r2), m + Vector2(-r2, 0)]), Color(0.4, 1.0, 0.95))


func _flash(at: float, dur: float, color: Color) -> void:
	_flashes.append([at, dur, color])


func _update_overlay() -> void:
	for c: Array in _captions:
		var t0: float = c[0]
		var t1: float = c[1]
		var l: Label = c[2]
		var back: TextureRect = c[3]
		if t < t0 or t > t1:
			l.modulate.a = 0.0
			back.modulate.a = 0.0
			continue
		var a := minf(clampf((t - t0) / 0.28, 0.0, 1.0), clampf((t1 - t) / 0.3, 0.0, 1.0))
		l.modulate.a = a
		back.modulate.a = a
		var k := clampf((t - t0) / (t1 - t0), 0.0, 1.0)
		var s := lerpf(1.03, 1.0, sqrt(k))
		l.scale = Vector2(s, s)
		(l.label_settings.font as FontVariation).spacing_glyph = int(lerpf(1.0, 4.0, k))
	# Flashes
	var fa := 0.0
	var fc := Color.WHITE
	for f: Array in _flashes:
		var at: float = f[0]
		var dur: float = f[1]
		if t >= at and t <= at + dur:
			var a := 1.0 - (t - at) / dur
			if a > fa:
				fa = a
				fc = f[2]
	flash_rect.color = Color(fc.r, fc.g, fc.b, fa * fc.a)
	# Title
	if t >= T_TITLE:
		var lt := t - T_TITLE
		var title: Label = _title_nodes[0]
		title.modulate.a = clampf(lt / 0.5, 0.0, 1.0)
		_title_backdrop.modulate.a = clampf(lt / 0.6, 0.0, 1.0) * clampf((DURATION - 0.15 - t) / 0.6, 0.0, 1.0)
		var s := lerpf(1.12, 1.0, clampf(lt / 0.9, 0.0, 1.0))
		title.scale = Vector2(s, s)
		(title.label_settings.font as FontVariation).spacing_glyph = int(lerpf(7.0, 5.0, clampf(lt / 1.2, 0.0, 1.0)))
		(_title_nodes[1] as CanvasItem).modulate.a = clampf((lt - 0.45) / 0.4, 0.0, 1.0)
		var sub: Label = _title_nodes[2]
		sub.modulate.a = clampf((lt - 0.65) / 0.5, 0.0, 1.0)
		(sub.label_settings.font as FontVariation).spacing_glyph = int(lerpf(3.0, 8.0, clampf((lt - 0.65) / 1.6, 0.0, 1.0)))
		(_title_nodes[3] as CanvasItem).modulate.a = clampf((lt - 1.6) / 0.6, 0.0, 1.0) * 0.9
		var out := clampf((DURATION - 0.15 - t) / 0.6, 0.0, 1.0)
		for n: CanvasItem in _title_nodes:
			n.modulate.a *= out
		_title_ornament.queue_redraw()
	# Global grade + fades
	var fade := 0.0
	if t < 0.25:
		fade = 1.0 - t / 0.25
	if t >= T_BLACK and t < T_TITLE:
		fade = 1.0
	if t > DURATION - 1.2:
		fade = clampf((t - (DURATION - 1.2)) / 1.1, 0.0, 1.0)
	grade_mat.set_shader_parameter("fade", fade)
	grade_mat.set_shader_parameter("frame", float(frame))


func _grade(sat: float, contrast: float, vignette: float, tint_mix: float = 0.0, flicker: float = 0.0) -> void:
	grade_mat.set_shader_parameter("saturation", sat)
	grade_mat.set_shader_parameter("contrast", contrast)
	grade_mat.set_shader_parameter("vignette", vignette)
	grade_mat.set_shader_parameter("tint", Vector3(1.0, 0.78, 0.55))
	grade_mat.set_shader_parameter("tint_mix", tint_mix)
	grade_mat.set_shader_parameter("flicker", flicker)


# ================================================================ cues (sound + flashes)

func _build_cues() -> void:
	# [time, sound, volume_db, pitch]
	_cues = [
		[0.15, "rift", -12.0, 0.7],
		[2.2, "rift", -5.0, 0.55],
		[4.0, "boom", -3.0, 0.9],
		[7.8, "whoosh_heavy", -6.0, 0.7],
		[8.6, "boom", -8.0, 1.2],
		[9.0, "rift", -8.0, 1.5],
		[10.0, "boom", -3.0, 0.85],
		[10.45, "boom", -5.0, 1.1],
		[10.5, "roar", -9.0, 1.2],
		[10.95, "boom", -5.0, 1.0],
		[11.0, "roar", -9.0, 1.05],
		[11.45, "boom", -3.0, 0.9],
		[11.5, "roar", -6.0, 0.95],
		[20.0, "boom", 0.0, 0.7],
		[20.3, "roar", -3.0, 0.5],
		[24.05, "roar", 0.0, 0.42],
		[27.6, "rift", -6.0, 1.8],
		[29.0, "whoosh_heavy", -4.0, 0.9],
		[29.1, "step", -16.0, 1.0],
		[29.4, "step", -16.0, 1.1],
		[29.7, "step", -16.0, 1.0],
		[30.0, "screech", -6.0, 0.9],
		[30.25, "whoosh_heavy", -2.0, 0.7],
		[30.9, "whoosh_heavy", -4.0, 0.9],
		[31.3, "hit_heavy", 0.0, 0.85],
		[31.3, "boom", -2.0, 1.0],
		[31.9, "roar", -8.0, 1.1],
		[32.2, "whoosh", -4.0, 0.7],
		[32.32, "boom", -1.0, 1.0],
		[32.8, "roar", -2.0, 0.45],
		[T_TITLE, "boom", 2.0, 0.75],
		[T_TITLE, "hit_heavy", 0.0, 0.7],
	]
	for f in [[4.0, 0.1, Color(1, 1, 1, 0.3)], [10.0, 0.15, Color(0.8, 1.0, 1.0, 0.5)], [10.45, 0.07, Color(1, 1, 1, 0.18)],
			[10.95, 0.07, Color(1, 1, 1, 0.18)], [11.45, 0.1, Color(1, 1, 1, 0.3)], [20.0, 0.2, Color(0.75, 1.0, 1.0, 0.35)],
			[31.3, 0.14, Color(1, 0.85, 0.6, 0.7)], [32.32, 0.1, Color(1, 0.6, 0.4, 0.35)], [T_TITLE, 0.3, Color(1, 0.82, 0.45, 0.45)]]:
		_flash(f[0], f[1], f[2])


func _mute_buses(on: bool) -> void:
	AudioServer.set_bus_mute(AudioServer.get_bus_index("Music"), on)
	AudioServer.set_bus_mute(AudioServer.get_bus_index("SFX"), on)


func _run_cues() -> void:
	while _cue_i < _cues.size() and float(_cues[_cue_i][0]) <= t + 0.0001:
		var c: Array = _cues[_cue_i]
		Sfx.play(String(c[1]), float(c[2]), float(c[3]))
		_cue_i += 1


# ================================================================ shots

func _build_shots() -> void:
	shots = [
		[0.0, 4.0, "omen", _shot_omen],
		[4.0, 6.2, "guardian_back", _shot_guardian_back],
		[6.2, 7.8, "guardian_detail", _shot_guardian_detail],
		[7.8, 8.6, "memory", _shot_memory],
		[8.6, 10.0, "guardian_vow", _shot_guardian_vow],
		[10.0, 11.0, "invasion_sky", _shot_invasion_sky],
		[11.0, T_GAME_START, "invasion_land", _shot_invasion_land],
		[T_GAME_START, 14.0, "combat_wide", _shot_combat_wide],
		[14.0, 15.4, "combat_gamecam", _shot_combat_gamecam],
		[15.4, 17.0, "combat_side", _shot_combat_side],
		[17.0, 18.6, "combat_crane", _shot_combat_crane],
		[18.6, T_GAME_PAUSE, "combat_hero", _shot_combat_hero],
		[T_GAME_PAUSE, 23.2, "colossus_rise", _shot_colossus_rise],
		[23.2, 26.0, "colossus_wide", _shot_colossus_wide],
		[26.0, 27.6, "colossus_head", _shot_colossus_head],
		[27.6, 29.0, "blade_light", _shot_blade_light],
		[29.0, 30.0, "montage_charge", _shot_m_charge],
		[30.0, 30.9, "montage_alien", _shot_m_alien],
		[30.9, 31.9, "montage_heavy", _shot_m_heavy],
		[31.9, 32.8, "montage_dodge", _shot_m_dodge],
		[32.8, T_GAME_RESUME, "montage_looms", _shot_m_looms],
		[T_GAME_RESUME, T_BLACK, "finisher_gameplay", _shot_finisher],
		[T_BLACK, T_TITLE, "black", _shot_black],
		[T_TITLE, DURATION + 1.0, "title", _shot_title],
	]


func _process(_delta: float) -> void:
	t = frame / FPS
	if not preview_times.is_empty():
		var pi := mini(_preview_i, preview_times.size() - 1)
		frame = int(float(preview_times[pi]) * FPS)
		t = frame / FPS
		_preview_i += 1
	if not _music_started and music.stream != null:
		_music_started = true
		music.play(t)
	var i := shots.size() - 1
	while i > 0 and t < float(shots[i][0]):
		i -= 1
	if i != _shot_i:
		_shot_i = i
		_shot_first = true
		_log("SHOT %s" % shots[i][2])
	var s: Array = shots[i]
	var t0: float = s[0]
	var t1: float = s[1]
	var fn: Callable = s[3]
	_update_world()
	fn.call(t - t0, clampf((t - t0) / maxf(t1 - t0, 0.001), 0.0, 1.0))
	_shot_first = false
	var silent := (t >= T_BLACK and t < T_TITLE - 0.01) or t >= DURATION - 0.12
	if silent != _muted:
		_muted = silent
		_mute_buses(silent)
	_run_cues()
	_update_overlay()
	_trauma = maxf(_trauma - (1.0 / FPS) * 1.4, 0.0)
	if not game_running:
		Engine.time_scale = 1.0
	# Cinematic actors are advanced with the trailer clock, immune to hit-stop.
	for e: Array in _actors_anim:
		var ap: AnimationPlayer = e[0]
		if ap.is_inside_tree() and float(e[1]) != 0.0:
			ap.advance((1.0 / FPS) * float(e[1]))
	frame += 1
	if not preview_times.is_empty() and _preview_i >= preview_times.size():
		get_tree().quit()
	if t >= DURATION:
		_log("END")
		get_tree().quit()


func _shake_offset() -> Vector3:
	var s := _trauma * _trauma
	var tt := frame / FPS * 40.0
	return Vector3(_noise.get_noise_2d(tt, 0.0), _noise.get_noise_2d(0.0, tt), _noise.get_noise_2d(tt, 77.0)) * s * 0.5


func _cam_path(keys: Array, u: float) -> void:
	CamPath.new(keys).apply(cam, u, _shake_offset())
	cam.current = true


## Time-driven world state shared by many shots: dusk, harbinger, colossus.
func _update_world() -> void:
	# The omen: the sky darkens and the stars go out one by one.
	var dark := smoothstep(0.4, 3.6, t) * 0.62
	var star_fade := smoothstep(0.9, 3.0, t)
	sky_mat.set_shader_parameter("darkness", dark)
	sky_mat.set_shader_parameter("star_fade", star_fade)
	sky_mat.set_shader_parameter("sunset", 1.0 - smoothstep(0.3, 3.4, t))
	_rift_mat.set_shader_parameter("intensity", smoothstep(1.8, 3.6, t))
	var dk := dark / 0.62
	cine_env.fog_density = lerpf(0.0042, 0.0028, dk)
	cine_env.fog_light_color = Color(0.92, 0.64, 0.48).lerp(Color(0.5, 0.38, 0.52), dk)
	# Harbinger rises above the mountains, then hangs there.
	var rise := smoothstep(1.4, 4.2, t)
	harbinger.position.y = lerpf(-120.0, 285.0, 1.0 - pow(1.0 - rise, 2.2)) + sin(t * 0.6) * 3.0
	_harb_shards.rotation.y = t * 0.12
	# Corona sits just behind the body and always faces the arena.
	var hp := harbinger.global_position
	_corona.global_position = hp + hp.normalized() * 8.0
	_corona.look_at(Vector3(0, 5, 0), Vector3.UP)
	_harb_corona.set_shader_parameter("intensity", lerpf(0.0, 1.0, smoothstep(1.6, 3.4, t)))
	_harb_body.set_shader_parameter("intensity", 1.0)
	if colossus.visible:
		(_colossus_fx[1] as Node3D).global_position = (colossus.joints["sh_r"] as Node3D).global_position
		(_colossus_fx[2] as Node3D).global_position = (colossus.joints["sh_l"] as Node3D).global_position


func _set_light(sun_e: float, rim_e: float, ambient: float) -> void:
	sun.light_energy = sun_e
	rim.light_energy = rim_e
	cine_env.ambient_light_energy = ambient


func _hide_invaders() -> void:
	for a in invaders:
		a.visible = false


func _cine_mode() -> void:
	_show_game(false)
	_set_tag("IN-ENGINE CINEMATIC")


# ---------------------------------------------------------------- 0–4 THE OMEN

func _shot_omen(lt: float, u: float) -> void:
	if _shot_first:
		_cine_mode()
		_grade(1.08, 1.06, 0.42)
		hero.visible = true
		_pose(hero, "idle", 0.0)
	_set_light(lerpf(1.7, 0.95, smoothstep(0.5, 3.5, lt)), lerpf(0.5, 1.0, u), lerpf(0.6, 0.42, u))
	_cam_path([
		[0.0, Vector3(26, 13, 48), Vector3(-10, 22, -260), 62.0],
		[0.55, Vector3(15, 9.5, 30), Vector3(-25, 70, -300), 60.0],
		[1.0, Vector3(9, 7.5, 21), Vector3(-40, 140, -330), 58.0],
	], u)


# ---------------------------------------------------------------- 4–10 THE FALLEN GUARDIAN

func _shot_guardian_back(lt: float, u: float) -> void:
	if _shot_first:
		_cine_mode()
		_grade(1.05, 1.08, 0.45)
		hero.global_position = Vector3(0, 0, 5)
		hero.rotation.y = 0.0
		_pose(hero, "idle", 0.3)
		hero.velocity = Vector3(0, 0, 1.2)
	_set_light(0.95, 1.1, 0.42)
	var h := hero.global_position
	_cam_path([
		[0.0, h + Vector3(0.7, 0.85, 3.4), h + Vector3(-1.5, 4.0, -26), 60.0],
		[1.0, h + Vector3(0.6, 1.0, 2.9), h + Vector3(-1.2, 4.3, -26), 56.0],
	], u)


func _shot_guardian_detail(lt: float, u: float) -> void:
	if _shot_first:
		_grade(1.05, 1.1, 0.5)
		_pose(hero, "idle", 0.9)
		hero.velocity = Vector3(0.5, 0, 0.8)
	var h := hero.global_position
	_set_light(0.55, 1.9, 0.3)
	_cam_path([
		[0.0, h + Vector3(-2.7, 1.7, -1.5), h + Vector3(0.0, 1.35, 0.0), 44.0],
		[1.0, h + Vector3(-2.2, 1.6, -2.3), h + Vector3(0.0, 1.4, 0.0), 42.0],
	], u)


func _shot_memory(lt: float, u: float) -> void:
	if _shot_first:
		_grade(0.6, 1.2, 0.7, 0.35, 1.0)
	_set_light(0.5, 0.5, 0.3)
	_cam_path([
		[0.0, Vector3(-9.0, 1.3, -24.5), Vector3(-15, 11.5, -33), 66.0],
		[1.0, Vector3(-9.8, 1.7, -25.8), Vector3(-15, 13.0, -33), 62.0],
	], u)


func _shot_guardian_vow(lt: float, u: float) -> void:
	if _shot_first:
		_grade(1.08, 1.1, 0.48)
		hero.global_position = Vector3(0, 0, 5)
		hero.rotation.y = 0.0
		_pose(hero, "heavy", 0.0, 0.55, 0.15)
		hero.trail.color = Color(0.4, 1.0, 0.95, 0.9)
		_cosmic.emitting = true
	_set_light(0.85, 1.4, 0.4)
	# Hold the raised-axe pose once the wind-up is reached.
	if hero.anim.current_animation_position >= 0.41:
		_set_anim_speed(hero.anim, 0.0)
	var glow := smoothstep(0.2, 1.1, lt)
	edge_mat.emission_energy_multiplier = glow * (1.1 + 0.4 * sin(lt * 31.0))
	_cosmic.global_position = hero.axe_head_position()
	var h := hero.global_position
	_cam_path([
		[0.0, h + Vector3(2.3, 0.55, 2.9), h + Vector3(-0.4, 2.4, -2.0), 58.0],
		[1.0, h + Vector3(1.9, 0.5, 2.4), h + Vector3(-0.4, 2.7, -2.0), 54.0],
	], u)


# ---------------------------------------------------------------- 10–12 THE INVASION (cinematic)

const LANDINGS := [[10.45, Vector3(-6.5, 0, -7)], [10.95, Vector3(6.2, 0, -9)], [11.45, Vector3(0, 0, -3)]]


func _update_invaders() -> void:
	for i in invaders.size():
		var a := invaders[i]
		var land_t: float = LANDINGS[i][0]
		var land: Vector3 = LANDINGS[i][1]
		var start := land_t - 0.75
		if t < start:
			a.visible = false
			continue
		if not a.visible:
			a.visible = true
			a.begin_intro(land)
			a.rotation.y = atan2(-(0.0 - land.x), -(5.0 - land.z)) if i < 2 else PI
		if t < land_t:
			var k := clampf((t - start) / 0.75, 0.0, 1.0)
			a.global_position = land + Vector3(-9.0 * (1.0 - k), 24.0 * (1.0 - k * k), -3.0 * (1.0 - k))
		elif a.state == StarEater.State.INTRO:
			a.global_position = land
			a.land_intro()
			a.state = StarEater.State.INACTIVE
			_pose(a, "roar", 0.0, 1.0)
			cine_fx.shockwave(land, Color(0.4, 1.0, 0.95), 6.0, 0.55)
			cine_fx.shockwave(land, Color(1.0, 0.6, 0.3), 3.8, 0.4)
			cine_fx.dust(land, 30, 6.0)
			cine_fx.burst(land + Vector3.UP * 0.5, Color(0.5, 1.0, 0.95), 40, 8.0, 0.7, 0.08, -10.0)
			cine_fx.impact_light(land + Vector3.UP * 1.5, Color(0.5, 1.0, 1.0), 6.0, 0.4, 14.0)
			_trauma = minf(_trauma + 0.7, 1.0)
			_log("invader %d landed" % i)


func _shot_invasion_sky(lt: float, u: float) -> void:
	if _shot_first:
		_grade(1.08, 1.1, 0.42)
		hero.global_position = Vector3(0, 0, 5)
		hero.rotation.y = 0.0
		_pose(hero, "idle", 0.0, 1.0, 0.2)
		edge_mat.emission_energy_multiplier = 0.0
		_cosmic.emitting = false
	_set_light(0.9, 1.2, 0.42)
	_update_invaders()
	var h := hero.global_position
	_cam_path([
		[0.0, h + Vector3(1.0, 0.6, 2.8), Vector3(-2, 15, -16), 70.0],
		[1.0, h + Vector3(0.8, 0.75, 2.4), Vector3(-1, 9, -12), 66.0],
	], u)


func _shot_invasion_land(lt: float, u: float) -> void:
	if _shot_first:
		_grade(1.08, 1.1, 0.42)
	_update_invaders()
	if lt >= 0.55 and hero.anim.current_animation != "block":
		_pose(hero, "block", 0.0, 1.0, 0.12)
	_cam_path([
		[0.0, Vector3(2.2, 0.75, 8.8), Vector3(-0.4, 2.3, -3.0), 52.0],
		[1.0, Vector3(1.9, 0.7, 8.2), Vector3(-0.3, 2.1, -3.0), 50.0],
	], u)


# ---------------------------------------------------------------- 12–20 COMBAT (real gameplay)

func _game_mode() -> void:
	_show_game(true)
	_set_game_running(true)
	_set_tag("IN-ENGINE PROTOTYPE GAMEPLAY")
	_grade(1.06, 1.06, 0.4)
	_hide_invaders()


func _shot_combat_wide(lt: float, u: float) -> void:
	if _shot_first:
		_game_mode()
	var ax := _game_axis()
	var fwd: Vector3 = ax[0]
	var side: Vector3 = ax[1]
	var p := game.player.global_position
	_place_game_cam(p - fwd * 4.6 - side * 2.0 + Vector3.UP * 0.8, _game_mid() + Vector3.UP * 1.9, 66.0, 0.12)


func _shot_combat_gamecam(lt: float, u: float) -> void:
	if _shot_first:
		game.camera_rig.cam.current = true


func _shot_combat_side(lt: float, u: float) -> void:
	var ax := _game_axis()
	var fwd: Vector3 = ax[0]
	var side: Vector3 = ax[1]
	var m := _game_mid()
	_place_game_cam(m + side * 6.0 - fwd * 0.8 + Vector3.UP * (1.5 + 0.3 * u), m + Vector3.UP * 1.5, 56.0, 0.15)


func _shot_combat_crane(lt: float, u: float) -> void:
	var ax := _game_axis()
	var fwd: Vector3 = ax[0]
	var side: Vector3 = ax[1]
	var m := _game_mid()
	var ang := lerpf(-0.9, 0.2, u)
	var dir := (fwd * -cos(ang) + side * sin(ang)).normalized()
	_place_game_cam(m + dir * 6.4 + Vector3.UP * lerpf(5.2, 3.0, u), m + Vector3.UP * 1.3, 62.0, 0.2)


func _shot_combat_hero(lt: float, u: float) -> void:
	var ax := _game_axis()
	var fwd: Vector3 = ax[0]
	var side: Vector3 = ax[1]
	var p := game.player.global_position
	_place_game_cam(p - fwd * 2.3 - side * 1.25 + Vector3.UP * 0.6, _game_mid() + Vector3.UP * 2.0, 66.0, 0.15)


# ---------------------------------------------------------------- 20–29 THE STAR EATER (cinematic)

func _colossus_rise(k: float) -> void:
	colossus.global_position.y = lerpf(-44.0, -4.0, 1.0 - pow(1.0 - k, 2.0))


func _shot_colossus_rise(lt: float, u: float) -> void:
	if _shot_first:
		_set_game_running(false)
		_cine_mode()
		_grade(1.02, 1.12, 0.5)
		hero.global_position = Vector3(0, 0, 5)
		hero.rotation.y = 0.0
		_pose(hero, "block", 0.12, 0.0)
		_hide_invaders()
		colossus.visible = true
		_pose(colossus, "roar", 0.2, 0.45)
		for f in _colossus_fx:
			f.visible = true
			f.emitting = true
		colossus._glow_target = Color(0.35, 1.0, 0.95)
	_set_light(0.8, 1.5, 0.4)
	_colossus_rise(smoothstep(0.0, 3.0, lt))
	_trauma = maxf(_trauma, 0.35 * (1.0 - u))
	var h := hero.global_position
	_cam_path([
		[0.0, h + Vector3(1.2, 0.45, 3.9), Vector3(0, 9, -40), 72.0],
		[1.0, h + Vector3(1.0, 0.55, 3.2), Vector3(0, 17, -50), 64.0],
	], u)


func _shot_colossus_wide(lt: float, u: float) -> void:
	if _shot_first:
		_grade(1.02, 1.1, 0.45)
		_colossus_rise(1.0)
		_pose(colossus, "idle", 0.0, 0.6)
		(_colossus_fx[1] as CPUParticles3D).emitting = false
		(_colossus_fx[2] as CPUParticles3D).emitting = false
		(_colossus_fx[3] as CPUParticles3D).emitting = false
	if lt >= 0.85 and not _roared:
		_roared = true
		_pose(colossus, "roar", 0.0, 1.0, 0.25)
		var base := Vector3(0, 0.2, -58)
		cine_fx.shockwave(base, Color(0.45, 1.0, 0.95), 46.0, 1.3)
		cine_fx.shockwave(base, Color(1.0, 0.6, 0.35), 30.0, 1.0)
		cine_fx.dust(base + Vector3(0, 2, 0), 40, 14.0)
		colossus._glow_target = Color(0.6, 1.0, 1.0)
	if lt >= 0.85:
		_trauma = maxf(_trauma, 0.45 * (1.0 - clampf((lt - 0.85) / 1.6, 0.0, 1.0)))
	_cam_path([
		[0.0, Vector3(26, 6, 32), Vector3(-2, 19, -52), 52.0],
		[1.0, Vector3(21, 5, 25), Vector3(-2, 21, -54), 48.0],
	], u)


func _shot_colossus_head(lt: float, u: float) -> void:
	if _shot_first:
		_grade(1.0, 1.15, 0.55)
		_pose(colossus, "idle", 0.5, 0.5, 0.3)
		colossus._glow_target = Color(0.4, 1.0, 0.95)
	var hp := colossus.head_position()
	_cam_path([
		[0.0, Vector3(2.0, 1.3, -13.5), hp + Vector3(0, -5.0, 0), 40.0],
		[1.0, Vector3(1.8, 1.2, -15.0), hp + Vector3(0, -3.5, 0), 36.0],
	], u)


func _shot_blade_light(lt: float, u: float) -> void:
	if _shot_first:
		_grade(1.05, 1.12, 0.6)
		hero.global_position = Vector3(0, 0, 5)
		hero.rotation.y = 0.0
		_pose(hero, "heavy", 0.42, 0.0)
		_cosmic.emitting = true
	_set_light(0.55, 1.8, 0.32)
	edge_mat.emission_energy_multiplier = (0.7 + 0.8 * smoothstep(0.0, 1.0, lt)) * (0.8 + 0.3 * sin(lt * 37.0))
	var ax := hero.axe_head_position()
	_cosmic.global_position = ax
	var h := hero.global_position
	var focus := (ax + h + Vector3(0, 1.75, 0)) * 0.5
	_cam_path([
		[0.0, h + Vector3(1.25, 1.45, -1.9), focus, 46.0],
		[1.0, h + Vector3(1.0, 1.5, -1.55), focus, 42.0],
	], u)


# ---------------------------------------------------------------- 29–33.6 FINAL MONTAGE (cinematic)

func _shot_m_charge(lt: float, u: float) -> void:
	if _shot_first:
		_cine_mode()
		_grade(1.1, 1.12, 0.45)
		_cosmic.emitting = false
		edge_mat.emission_energy_multiplier = 1.5
		_pose(hero, "run", 0.0, 1.25)
		hero.rotation.y = 0.0
		var a := invaders[2]
		a.visible = true
		a.global_position = Vector3(0, 0, -6)
		a.rotation.y = PI
		_pose(a, "roar", 0.3, 1.0)
	var z := lerpf(7.5, 1.7, u)
	hero.global_position = Vector3(0, 0, z)
	hero.velocity = Vector3(0, 0, -6.0)
	var h := hero.global_position
	CamPath.new([[0.0, Vector3(0.65, 0.75, -0.5), h + Vector3(0, 1.3, 0), 58.0]]).apply(cam, 0.0, _shake_offset())


func _shot_m_alien(lt: float, u: float) -> void:
	if _shot_first:
		_grade(1.1, 1.12, 0.45)
		hero.velocity = Vector3.ZERO
		var a := invaders[2]
		a.global_position = Vector3(0, 0, -3)
		a.rotation.y = PI
		_pose(a, "swipe_r", 0.42, 1.35)
		a._glow_target = Color(1.0, 0.85, 0.3)
		for tr in a._trails:
			tr.emitting = true
		hero.visible = false
	var a2 := invaders[2]
	if lt > 0.55:
		for tr in a2._trails:
			tr.emitting = false
	_cam_path([
		[0.0, Vector3(-1.2, 0.8, 1.3), Vector3(0.6, 2.4, -3.0), 64.0],
		[1.0, Vector3(-1.0, 0.7, 0.9), Vector3(0.4, 2.2, -3.0), 60.0],
	], u)


func _shot_m_heavy(lt: float, u: float) -> void:
	if _shot_first:
		_grade(1.1, 1.14, 0.45)
		for tr in invaders[2]._trails:
			tr.emitting = false
		var tgt := invaders[2]
		tgt.visible = true
		tgt._glow_target = tgt._glow_base
		tgt.global_position = Vector3(0, 0, 1.0)
		tgt.rotation.y = PI
		_pose(tgt, "stagger", 0.3, 0.0)
		hero.visible = true
		hero.global_position = Vector3(0, 0, 3)
		hero.rotation.y = 0.0
		_pose(hero, "heavy", 0.18, 1.0)
		hero.trail.color = Color(1.0, 0.72, 0.32, 0.95)
		hero.trail.emitting = true
	# Impact at 0.4 s, then slow motion for weight.
	if lt >= 0.4 and lt < 0.4 + 1.0 / FPS:
		var p := hero.axe_head_position()
		p.y = 0.05
		cine_fx.shockwave(p, Color(1.0, 0.65, 0.25), 3.2, 0.45)
		cine_fx.sparks(p + Vector3.UP * 0.2, Color(1.0, 0.75, 0.3), 40)
		cine_fx.dust(p, 24, 4.5)
		cine_fx.impact_light(p + Vector3.UP * 0.8, Color(1.0, 0.6, 0.3), 5.0, 0.3)
		var contact := hero.axe_head_position()
		cine_fx.ichor(contact, Vector3(0, 0.6, -1.0), 40)
		invaders[2]._flash()
		_pose(invaders[2], "flinch", 0.0, 0.6)
		_trauma = minf(_trauma + 0.8, 1.0)
		hero.trail.emitting = false
	if lt >= 0.42:
		_set_anim_speed(hero.anim, 0.35)
	var h := hero.global_position
	_cam_path([
		[0.0, h + Vector3(4.6, 1.0, -0.95), h + Vector3(0.0, 1.35, -0.95), 64.0],
		[1.0, h + Vector3(4.2, 0.9, -1.0), h + Vector3(0.0, 1.15, -0.95), 60.0],
	], u)


func _shot_m_dodge(lt: float, u: float) -> void:
	if _shot_first:
		_grade(1.1, 1.12, 0.45)
		invaders[2].visible = false
		var a := invaders[1]
		a.visible = true
		a.global_position = Vector3(0, 0, -0.6)
		a.rotation.y = PI
		_pose(a, "slam", 0.55, 1.0)
		hero.global_position = Vector3(0, 0, 2.2)
		hero.rotation.y = -PI * 0.5
		_pose(hero, "roll", 0.0, 0.9)
	var a1 := invaders[1]
	# Roll sideways out of the slam (anim impact at 0.97 s -> lt 0.42).
	var k := smoothstep(0.0, 0.55, lt)
	hero.global_position = Vector3(lerpf(0.0, 3.0, k), 0, 2.2)
	hero.velocity = Vector3(5.0, 0, 0)
	if lt >= 0.42 and lt < 0.42 + 1.0 / FPS:
		var c := a1.global_position + Vector3(0, 0.05, 2.4)
		cine_fx.shockwave(c, Color(1.0, 0.35, 0.2), 4.0, 0.5)
		cine_fx.shockwave(c, Color(0.4, 1.0, 0.9), 2.6, 0.35)
		cine_fx.dust(c, 30, 5.0)
		cine_fx.impact_light(c + Vector3.UP, Color(1.0, 0.5, 0.3), 5.0, 0.3, 9.0)
		_trauma = minf(_trauma + 0.7, 1.0)
	_cam_path([
		[0.0, Vector3(1.2, 1.3, 9.0), Vector3(0.9, 1.4, 0.0), 56.0],
		[1.0, Vector3(1.6, 1.2, 8.4), Vector3(1.4, 1.3, 0.0), 54.0],
	], u)


func _shot_m_looms(lt: float, u: float) -> void:
	if _shot_first:
		_grade(1.04, 1.14, 0.5)
		hero.global_position = Vector3(1.5, 0, 4)
		hero.rotation.y = 0.0
		hero.velocity = Vector3.ZERO
		_pose(hero, "block", 0.12, 0.0)
		var a := invaders[1]
		a.global_position = Vector3(-1.5, 0, -2.0)
		a.rotation.y = PI * 0.9
		_pose(a, "idle", 0.0, 1.0)
		_pose(colossus, "roar", 0.3, 0.7)
	_trauma = maxf(_trauma, 0.3)
	_cam_path([
		[0.0, Vector3(3.6, 1.6, 13.5), Vector3(0, 13, -40), 66.0],
		[1.0, Vector3(3.2, 1.4, 12.2), Vector3(0, 15, -44), 62.0],
	], u)


# ---------------------------------------------------------------- 33.6–37.3 FINISHER (real gameplay)

func _shot_finisher(lt: float, u: float) -> void:
	if _shot_first:
		_game_mode()
		_grade(1.08, 1.1, 0.45)
		game.camera_rig.cam.current = true
	if t >= 36.5:
		var ax := _game_axis()
		var fwd: Vector3 = ax[0]
		var side: Vector3 = ax[1]
		var p := game.player.global_position
		var k := clampf((t - 36.5) / 0.8, 0.0, 1.0)
		var first := not game_cam.current
		# Beside the dissolving creature, never inside it.
		_place_game_cam(p + fwd * lerpf(1.5, 1.2, k) + side * 1.5 + Vector3.UP * 0.55, p + Vector3.UP * 1.6, 50.0, 1.0 if first else 0.25)


func _shot_black(lt: float, u: float) -> void:
	if _shot_first:
		_set_game_running(false)
		_cine_mode()
		tag.visible = false


# ---------------------------------------------------------------- 37.6– TITLE

func _shot_title(lt: float, u: float) -> void:
	if _shot_first:
		_cine_mode()
		tag.visible = false
		_grade(1.0, 1.2, 0.6)
		_hide_invaders()
		hero.visible = true
		hero.global_position = Vector3(0, 0, 6)
		hero.rotation.y = 0.0
		hero.velocity = Vector3(0, 0, 1.0)
		_pose(hero, "victory", 0.6, 0.0)
		edge_mat.emission_energy_multiplier = 3.0
		_colossus_rise(1.0)
		_pose(colossus, "idle", 0.0, 0.5)
		_cosmic.emitting = true
	_cosmic.global_position = hero.axe_head_position()
	_set_light(0.12, 1.8, 0.12)
	var h := hero.global_position
	_cam_path([
		[0.0, h + Vector3(0.6, 1.6, 6.8), Vector3(0, 6.5, -30), 62.0],
		[1.0, h + Vector3(0.5, 1.5, 6.0), Vector3(0, 7.0, -30), 60.0],
	], clampf(lt / 4.4, 0.0, 1.0))

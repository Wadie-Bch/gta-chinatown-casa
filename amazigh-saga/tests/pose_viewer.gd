extends Node3D
## Development tool: renders chosen animation frames of both characters, one per
## video frame, so poses can be reviewed as a contact sheet via Movie Maker.
## Usage: godot --path . --write-movie out/p.png --fixed-fps 1 res://tests/pose_viewer.tscn -- <which>

var shots: Array = []
var _i := -1
var warrior: Warrior
var alien: StarEater
var cam: Camera3D


func _ready() -> void:
	var env := WorldEnvironment.new()
	var e := Environment.new()
	e.background_mode = Environment.BG_COLOR
	e.background_color = Color(0.25, 0.22, 0.28)
	e.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	e.ambient_light_color = Color(0.6, 0.6, 0.7)
	e.ambient_light_energy = 0.7
	e.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	env.environment = e
	add_child(env)
	var sun := DirectionalLight3D.new()
	sun.light_energy = 1.4
	sun.shadow_enabled = true
	add_child(sun)
	sun.global_transform = Transform3D(Basis.looking_at(Vector3(-0.5, -0.6, -0.6).normalized(), Vector3.UP), Vector3.ZERO)
	var floor_mi := MeshInstance3D.new()
	var pm := PlaneMesh.new()
	pm.size = Vector2(30, 30)
	floor_mi.mesh = pm
	floor_mi.material_override = Build.mat(Color(0.7, 0.55, 0.42))
	add_child(floor_mi)
	cam = Camera3D.new()
	cam.fov = 40
	add_child(cam)
	var which := "warrior"
	if OS.get_cmdline_user_args().size() > 0:
		which = OS.get_cmdline_user_args()[0]
	if which == "warrior":
		warrior = preload("res://scenes/warrior.tscn").instantiate()
		add_child(warrior)
		warrior.set_physics_process(false)
		warrior.set_process_unhandled_input(false)
		for a in ["idle", "run", "light1", "light2", "light3", "heavy", "block", "roll", "hit", "death", "finisher", "victory"]:
			var anim: Animation = warrior.anim.get_animation(a)
			for k in 4:
				shots.append([a, anim.length * float(k) / 3.0])
	else:
		alien = preload("res://scenes/star_eater.tscn").instantiate()
		add_child(alien)
		alien.set_physics_process(false)
		for a in ["idle", "walk", "swipe_r", "swipe_l", "slam", "lunge", "flinch", "stagger", "kneel", "doom", "roar", "fall"]:
			var anim: Animation = alien.anim.get_animation(a)
			for k in 4:
				shots.append([a, anim.length * float(k) / 3.0])


func _process(_delta: float) -> void:
	_i += 1
	if _i >= shots.size():
		get_tree().quit()
		return
	var s: Array = shots[_i]
	var body: Node3D = warrior if warrior else alien
	var ap: AnimationPlayer = body.get_node("AnimationPlayer")
	ap.play(s[0], 0.0)
	ap.seek(float(s[1]), true)
	ap.pause()
	var h := 1.0 if warrior else 1.8
	var d := 4.2 if warrior else 7.5
	# Three-quarter front view from the character's front-right.
	cam.global_position = Vector3(d * 0.65, h + 0.6, -d * 0.76)
	cam.look_at(Vector3(0, h, 0), Vector3.UP)

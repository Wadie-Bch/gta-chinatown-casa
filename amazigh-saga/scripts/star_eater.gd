class_name StarEater
extends CharacterBody3D
## The Star-Eater: an original extraterrestrial creature with scythe arms,
## a chitin carapace and glowing star-veins. Boss AI with telegraphed attacks.

signal health_changed(current: float, maximum: float)
signal poise_changed(current: float, maximum: float)
signal staggered
signal defeated
signal died
signal attack_started(attack: String, unblockable: bool)

enum State { INACTIVE, INTRO, STALK, ATTACK, FLINCH, RECOIL, STAGGER, KNEEL, DYING, DEAD }

const MAX_POISE := 100.0
const GRAVITY := 22.0
const WALK_SPEED := 2.7
const STAGGER_TIME := 1.6
const HIPS_REST := Vector3(0, 1.7, 0)

const ATTACKS := {
	"swipe_r": {"windup": 0.62, "active": 0.2, "recover": 0.58, "damage": 14.0, "boxes": ["blade_r"],
		"parryable": true, "blockable": true, "step": 3.0, "knockback": 5.0},
	"swipe_l": {"windup": 0.42, "active": 0.2, "recover": 0.62, "damage": 14.0, "boxes": ["blade_l"],
		"parryable": true, "blockable": true, "step": 3.0, "knockback": 5.0},
	"slam": {"windup": 0.85, "active": 0.12, "recover": 0.9, "damage": 24.0, "boxes": ["blade_r", "blade_l"],
		"parryable": false, "blockable": false, "step": 1.5, "aoe": 3.3, "knockback": 8.0},
	"lunge": {"windup": 0.55, "active": 0.4, "recover": 0.7, "damage": 18.0, "boxes": ["body"],
		"parryable": false, "blockable": true, "dash": 13.0, "knockback": 9.0},
}

const POSES := {
	"idle_a": {"root": Vector3(0, 0, 0), "spine": Vector3(-24, 0, 0), "neck": Vector3(10, 0, 0), "head": Vector3(10, 0, 0), "jaw": Vector3(8, 0, 0),
		"sh_r": Vector3(22, -10, 30), "el_r": Vector3(70, 0, 0), "sh_l": Vector3(22, 10, -30), "el_l": Vector3(70, 0, 0),
		"hip_r": Vector3(32, 0, 8), "knee_r": Vector3(-72, 0, 0), "ankle_r": Vector3(48, 0, 0),
		"hip_l": Vector3(32, 0, -8), "knee_l": Vector3(-72, 0, 0), "ankle_l": Vector3(48, 0, 0),
		"tail1": Vector3(-25, 0, 0), "tail2": Vector3(-15, 0, 0), "tail3": Vector3(-10, 0, 0)},
	"idle_b": {"root": Vector3(0, -0.06, 0), "spine": Vector3(-20, 0, 0), "neck": Vector3(8, 0, 0), "head": Vector3(12, 0, 0), "jaw": Vector3(16, 0, 0),
		"sh_r": Vector3(26, -10, 34), "el_r": Vector3(76, 0, 0), "sh_l": Vector3(26, 10, -34), "el_l": Vector3(76, 0, 0),
		"hip_r": Vector3(35, 0, 8), "knee_r": Vector3(-78, 0, 0), "ankle_r": Vector3(51, 0, 0),
		"hip_l": Vector3(35, 0, -8), "knee_l": Vector3(-78, 0, 0), "ankle_l": Vector3(51, 0, 0),
		"tail1": Vector3(-20, 0, 0), "tail2": Vector3(-12, 0, 0), "tail3": Vector3(-6, 0, 0)},
	"walk_a": {"root": Vector3(0, -0.04, 0), "spine": Vector3(-28, 8, 0), "neck": Vector3(12, 0, 0), "head": Vector3(10, -6, 0), "jaw": Vector3(8, 0, 0),
		"sh_r": Vector3(10, -10, 30), "el_r": Vector3(70, 0, 0), "sh_l": Vector3(36, 10, -30), "el_l": Vector3(70, 0, 0),
		"hip_r": Vector3(55, 0, 8), "knee_r": Vector3(-70, 0, 0), "ankle_r": Vector3(40, 0, 0),
		"hip_l": Vector3(5, 0, -8), "knee_l": Vector3(-70, 0, 0), "ankle_l": Vector3(60, 0, 0),
		"tail1": Vector3(-25, 10, 0), "tail2": Vector3(-15, 10, 0), "tail3": Vector3(-10, 10, 0)},
	"walk_b": {"root": Vector3(0, 0.06, 0), "spine": Vector3(-26, 0, 0), "neck": Vector3(12, 0, 0), "head": Vector3(10, 0, 0), "jaw": Vector3(8, 0, 0),
		"sh_r": Vector3(22, -10, 30), "el_r": Vector3(70, 0, 0), "sh_l": Vector3(22, 10, -30), "el_l": Vector3(70, 0, 0),
		"hip_r": Vector3(30, 0, 8), "knee_r": Vector3(-60, 0, 0), "ankle_r": Vector3(45, 0, 0),
		"hip_l": Vector3(40, 0, -8), "knee_l": Vector3(-110, 0, 0), "ankle_l": Vector3(70, 0, 0),
		"tail1": Vector3(-25, 0, 0), "tail2": Vector3(-15, 0, 0), "tail3": Vector3(-10, 0, 0)},
	"walk_c": {"root": Vector3(0, -0.04, 0), "spine": Vector3(-28, -8, 0), "neck": Vector3(12, 0, 0), "head": Vector3(10, 6, 0), "jaw": Vector3(8, 0, 0),
		"sh_r": Vector3(36, -10, 30), "el_r": Vector3(70, 0, 0), "sh_l": Vector3(10, 10, -30), "el_l": Vector3(70, 0, 0),
		"hip_l": Vector3(55, 0, -8), "knee_l": Vector3(-70, 0, 0), "ankle_l": Vector3(40, 0, 0),
		"hip_r": Vector3(5, 0, 8), "knee_r": Vector3(-70, 0, 0), "ankle_r": Vector3(60, 0, 0),
		"tail1": Vector3(-25, -10, 0), "tail2": Vector3(-15, -10, 0), "tail3": Vector3(-10, -10, 0)},
	"walk_d": {"root": Vector3(0, 0.06, 0), "spine": Vector3(-26, 0, 0), "neck": Vector3(12, 0, 0), "head": Vector3(10, 0, 0), "jaw": Vector3(8, 0, 0),
		"sh_r": Vector3(22, -10, 30), "el_r": Vector3(70, 0, 0), "sh_l": Vector3(22, 10, -30), "el_l": Vector3(70, 0, 0),
		"hip_l": Vector3(30, 0, -8), "knee_l": Vector3(-60, 0, 0), "ankle_l": Vector3(45, 0, 0),
		"hip_r": Vector3(40, 0, 8), "knee_r": Vector3(-110, 0, 0), "ankle_r": Vector3(70, 0, 0),
		"tail1": Vector3(-25, 0, 0), "tail2": Vector3(-15, 0, 0), "tail3": Vector3(-10, 0, 0)},
	"sr_wind": {"root": Vector3(0, -0.1, 0), "spine": Vector3(-14, -34, 0), "neck": Vector3(10, 18, 0), "head": Vector3(14, 12, 0), "jaw": Vector3(28, 0, 0),
		"sh_r": Vector3(70, -115, 20), "el_r": Vector3(55, 0, 0), "sh_l": Vector3(30, 20, -40), "el_l": Vector3(70, 0, 0),
		"hip_r": Vector3(25, 0, 10), "knee_r": Vector3(-75, 0, 0), "ankle_r": Vector3(50, 0, 0),
		"hip_l": Vector3(45, 0, -10), "knee_l": Vector3(-80, 0, 0), "ankle_l": Vector3(45, 0, 0),
		"tail1": Vector3(-25, 25, 0), "tail2": Vector3(-15, 20, 0), "tail3": Vector3(-10, 15, 0)},
	"sr_mid": {"root": Vector3(0, -0.2, 0), "spine": Vector3(-30, 0, 0), "neck": Vector3(10, 0, 0), "head": Vector3(6, 0, 0), "jaw": Vector3(30, 0, 0),
		"sh_r": Vector3(62, -10, 6), "el_r": Vector3(20, 0, 0), "sh_l": Vector3(30, 20, -40), "el_l": Vector3(70, 0, 0),
		"hip_r": Vector3(20, 0, 10), "knee_r": Vector3(-80, 0, 0), "ankle_r": Vector3(55, 0, 0),
		"hip_l": Vector3(55, 0, -10), "knee_l": Vector3(-85, 0, 0), "ankle_l": Vector3(40, 0, 0),
		"tail1": Vector3(-25, 0, 0), "tail2": Vector3(-15, 0, 0), "tail3": Vector3(-10, 0, 0)},
	"sr_end": {"root": Vector3(0, -0.2, 0), "spine": Vector3(-30, 34, 0), "neck": Vector3(8, -12, 0), "head": Vector3(6, -10, 0), "jaw": Vector3(20, 0, 0),
		"sh_r": Vector3(55, 85, -10), "el_r": Vector3(25, 0, 0), "sh_l": Vector3(20, 10, -50), "el_l": Vector3(60, 0, 0),
		"hip_r": Vector3(20, 0, 10), "knee_r": Vector3(-80, 0, 0), "ankle_r": Vector3(55, 0, 0),
		"hip_l": Vector3(55, 0, -10), "knee_l": Vector3(-85, 0, 0), "ankle_l": Vector3(40, 0, 0),
		"tail1": Vector3(-25, -25, 0), "tail2": Vector3(-15, -20, 0), "tail3": Vector3(-10, -15, 0)},
	"slam_wind": {"root": Vector3(0, 0.3, 0), "spine": Vector3(14, 0, 0), "neck": Vector3(-10, 0, 0), "head": Vector3(28, 0, 0), "jaw": Vector3(40, 0, 0),
		"sh_r": Vector3(170, -10, 28), "el_r": Vector3(40, 0, 0), "sh_l": Vector3(170, 10, -28), "el_l": Vector3(40, 0, 0),
		"hip_r": Vector3(18, 0, 10), "knee_r": Vector3(-50, 0, 0), "ankle_r": Vector3(35, 0, 0),
		"hip_l": Vector3(18, 0, -10), "knee_l": Vector3(-50, 0, 0), "ankle_l": Vector3(35, 0, 0),
		"tail1": Vector3(-45, 0, 0), "tail2": Vector3(-25, 0, 0), "tail3": Vector3(-15, 0, 0)},
	"slam_end": {"root": Vector3(0, -0.38, 0), "spine": Vector3(-48, 0, 0), "neck": Vector3(20, 0, 0), "head": Vector3(10, 0, 0), "jaw": Vector3(30, 0, 0),
		"sh_r": Vector3(60, -8, 14), "el_r": Vector3(8, 0, 0), "sh_l": Vector3(60, 8, -14), "el_l": Vector3(8, 0, 0),
		"hip_r": Vector3(60, 0, 12), "knee_r": Vector3(-115, 0, 0), "ankle_r": Vector3(60, 0, 0),
		"hip_l": Vector3(60, 0, -12), "knee_l": Vector3(-115, 0, 0), "ankle_l": Vector3(60, 0, 0),
		"tail1": Vector3(-5, 0, 0), "tail2": Vector3(0, 0, 0), "tail3": Vector3(5, 0, 0)},
	"lunge_wind": {"root": Vector3(0, -0.5, 0), "spine": Vector3(-48, 0, 0), "neck": Vector3(30, 0, 0), "head": Vector3(20, 0, 0), "jaw": Vector3(35, 0, 0),
		"sh_r": Vector3(-30, -10, 40), "el_r": Vector3(60, 0, 0), "sh_l": Vector3(-30, 10, -40), "el_l": Vector3(60, 0, 0),
		"hip_r": Vector3(60, 0, 10), "knee_r": Vector3(-120, 0, 0), "ankle_r": Vector3(70, 0, 0),
		"hip_l": Vector3(60, 0, -10), "knee_l": Vector3(-120, 0, 0), "ankle_l": Vector3(70, 0, 0),
		"tail1": Vector3(-35, 0, 0), "tail2": Vector3(-25, 0, 0), "tail3": Vector3(-20, 0, 0)},
	"lunge_air": {"root": Vector3(0, 0.15, 0), "spine": Vector3(-55, 0, 0), "neck": Vector3(30, 0, 0), "head": Vector3(20, 0, 0), "jaw": Vector3(45, 0, 0),
		"sh_r": Vector3(95, -15, 20), "el_r": Vector3(10, 0, 0), "sh_l": Vector3(95, 15, -20), "el_l": Vector3(10, 0, 0),
		"hip_r": Vector3(-20, 0, 10), "knee_r": Vector3(-40, 0, 0), "ankle_r": Vector3(30, 0, 0),
		"hip_l": Vector3(-30, 0, -10), "knee_l": Vector3(-30, 0, 0), "ankle_l": Vector3(30, 0, 0),
		"tail1": Vector3(-5, 0, 0), "tail2": Vector3(0, 0, 0), "tail3": Vector3(5, 0, 0)},
	"flinch": {"root": Vector3(0, 0.0, 0), "spine": Vector3(-6, 10, 0), "neck": Vector3(-10, 0, 0), "head": Vector3(30, 10, 0), "jaw": Vector3(40, 0, 0),
		"sh_r": Vector3(10, -10, 50), "el_r": Vector3(60, 0, 0), "sh_l": Vector3(10, 10, -50), "el_l": Vector3(60, 0, 0),
		"hip_r": Vector3(28, 0, 8), "knee_r": Vector3(-68, 0, 0), "ankle_r": Vector3(48, 0, 0),
		"hip_l": Vector3(28, 0, -8), "knee_l": Vector3(-68, 0, 0), "ankle_l": Vector3(48, 0, 0),
		"tail1": Vector3(-35, 0, 0), "tail2": Vector3(-20, 0, 0), "tail3": Vector3(-10, 0, 0)},
	"stagger": {"root": Vector3(0, -0.55, 0), "spine": Vector3(-30, 12, 0), "neck": Vector3(10, 0, 0), "head": Vector3(-10, 14, 0), "jaw": Vector3(30, 0, 0),
		"sh_r": Vector3(5, -10, 22), "el_r": Vector3(30, 0, 0), "sh_l": Vector3(30, 10, -30), "el_l": Vector3(40, 0, 0),
		"hip_r": Vector3(62, 0, 10), "knee_r": Vector3(-125, 0, 0), "ankle_r": Vector3(60, 0, 0),
		"hip_l": Vector3(42, 0, -12), "knee_l": Vector3(-80, 0, 0), "ankle_l": Vector3(48, 0, 0),
		"tail1": Vector3(-10, 0, 0), "tail2": Vector3(-5, 0, 0), "tail3": Vector3(0, 0, 0)},
	"kneel": {"root": Vector3(0, -1.08, 0), "spine": Vector3(-38, 0, 0), "neck": Vector3(12, 0, 0), "head": Vector3(-18, 0, 0), "jaw": Vector3(18, 0, 0),
		"sh_r": Vector3(6, -6, 18), "el_r": Vector3(20, 0, 0), "sh_l": Vector3(6, 6, -18), "el_l": Vector3(20, 0, 0),
		"hip_r": Vector3(88, 0, 12), "knee_r": Vector3(-150, 0, 0), "ankle_r": Vector3(62, 0, 0),
		"hip_l": Vector3(88, 0, -12), "knee_l": Vector3(-150, 0, 0), "ankle_l": Vector3(62, 0, 0),
		"tail1": Vector3(5, 0, 0), "tail2": Vector3(5, 0, 0), "tail3": Vector3(5, 0, 0)},
	"doom": {"root": Vector3(0, -0.95, 0), "spine": Vector3(12, 0, 0), "neck": Vector3(-30, 0, 0), "head": Vector3(40, 0, 0), "jaw": Vector3(50, 0, 0),
		"sh_r": Vector3(60, -20, 85), "el_r": Vector3(10, 0, 0), "sh_l": Vector3(60, 20, -85), "el_l": Vector3(10, 0, 0),
		"hip_r": Vector3(88, 0, 12), "knee_r": Vector3(-150, 0, 0), "ankle_r": Vector3(62, 0, 0),
		"hip_l": Vector3(88, 0, -12), "knee_l": Vector3(-150, 0, 0), "ankle_l": Vector3(62, 0, 0),
		"tail1": Vector3(-30, 0, 0), "tail2": Vector3(-20, 0, 0), "tail3": Vector3(-10, 0, 0)},
	"slump": {"root": Vector3(0, -1.3, 0), "spine": Vector3(-70, 0, 0), "neck": Vector3(20, 0, 0), "head": Vector3(-30, 0, 0), "jaw": Vector3(40, 0, 0),
		"sh_r": Vector3(-10, -6, 40), "el_r": Vector3(10, 0, 0), "sh_l": Vector3(-10, 6, -40), "el_l": Vector3(10, 0, 0),
		"hip_r": Vector3(95, 0, 16), "knee_r": Vector3(-155, 0, 0), "ankle_r": Vector3(62, 0, 0),
		"hip_l": Vector3(95, 0, -16), "knee_l": Vector3(-155, 0, 0), "ankle_l": Vector3(62, 0, 0),
		"tail1": Vector3(10, 0, 0), "tail2": Vector3(10, 0, 0), "tail3": Vector3(10, 0, 0)},
	"fall": {"root": Vector3(0, 0.2, 0), "spine": Vector3(-10, 0, 0), "neck": Vector3(-20, 0, 0), "head": Vector3(-10, 0, 0), "jaw": Vector3(10, 0, 0),
		"sh_r": Vector3(150, -20, 50), "el_r": Vector3(30, 0, 0), "sh_l": Vector3(150, 20, -50), "el_l": Vector3(30, 0, 0),
		"hip_r": Vector3(70, 0, 15), "knee_r": Vector3(-120, 0, 0), "ankle_r": Vector3(60, 0, 0),
		"hip_l": Vector3(70, 0, -15), "knee_l": Vector3(-120, 0, 0), "ankle_l": Vector3(60, 0, 0),
		"tail1": Vector3(-50, 0, 0), "tail2": Vector3(-30, 0, 0), "tail3": Vector3(-20, 0, 0)},
	"roar": {"root": Vector3(0, 0.1, 0), "spine": Vector3(10, 0, 0), "neck": Vector3(-25, 0, 0), "head": Vector3(38, 0, 0), "jaw": Vector3(55, 0, 0),
		"sh_r": Vector3(80, -30, 80), "el_r": Vector3(40, 0, 0), "sh_l": Vector3(80, 30, -80), "el_l": Vector3(40, 0, 0),
		"hip_r": Vector3(25, 0, 14), "knee_r": Vector3(-60, 0, 0), "ankle_r": Vector3(40, 0, 0),
		"hip_l": Vector3(25, 0, -14), "knee_l": Vector3(-60, 0, 0), "ankle_l": Vector3(40, 0, 0),
		"tail1": Vector3(-50, 0, 0), "tail2": Vector3(-30, 0, 0), "tail3": Vector3(-20, 0, 0)},
}

const ANIMS := {
	"idle": {"len": 2.0, "loop": true, "keys": [[0.0, "idle_a"], [1.0, "idle_b"], [2.0, "idle_a"]]},
	"walk": {"len": 1.1, "loop": true, "keys": [[0.0, "walk_a"], [0.275, "walk_b"], [0.55, "walk_c"], [0.825, "walk_d"], [1.1, "walk_a"]]},
	"swipe_r": {"len": 1.4, "keys": [[0.0, "idle_a"], [0.62, "sr_wind"], [0.72, "sr_mid"], [0.82, "sr_end"], [1.4, "idle_a"]]},
	"swipe_l": {"len": 1.24, "keys": [[0.0, "sl_start"], [0.42, "sl_wind"], [0.52, "sl_mid"], [0.62, "sl_end"], [1.24, "idle_a"]]},
	"slam": {"len": 1.87, "keys": [[0.0, "idle_a"], [0.85, "slam_wind"], [0.97, "slam_end"], [1.45, "slam_end"], [1.87, "idle_a"]]},
	"lunge": {"len": 1.65, "keys": [[0.0, "idle_a"], [0.55, "lunge_wind"], [0.75, "lunge_air"], [0.95, "lunge_wind"], [1.65, "idle_a"]]},
	"flinch": {"len": 0.4, "keys": [[0.0, "idle_a"], [0.08, "flinch"], [0.4, "idle_a"]]},
	"recoil": {"len": 0.9, "keys": [[0.0, "idle_a"], [0.1, "flinch"], [0.45, "flinch"], [0.9, "idle_a"]]},
	"stagger": {"len": 1.6, "keys": [[0.0, "flinch"], [0.3, "stagger"], [1.2, "stagger"], [1.6, "idle_a"]]},
	"kneel": {"len": 0.8, "keys": [[0.0, "flinch"], [0.8, "kneel"]]},
	"doom": {"len": 1.6, "keys": [[0.0, "kneel"], [0.12, "doom"], [0.9, "doom"], [1.6, "slump"]]},
	"fall": {"len": 0.5, "keys": [[0.0, "fall"], [0.5, "fall"]]},
	"roar": {"len": 1.5, "keys": [[0.0, "slam_end"], [0.35, "roar"], [1.1, "roar"], [1.5, "idle_a"]]},
}

var max_hp := 600.0
var hp := 600.0
var poise := 0.0
var state := State.INACTIVE
var ai_enabled := false
var target: Warrior
var rng := RandomNumberGenerator.new()
var attack_id := 0
var joints := {}

var _state_t := 0.0
var _atk := ""
var _atk_t := 0.0
var _atk_hit := false
var _combo_next := ""
var _cooldown := 1.0
var _strafe := 1.0
var _since_hit := 10.0
var _pressure := 0.0
var _anim_name := ""
var _t := 0.0
var _meshes: Array[MeshInstance3D] = []
var _flash_mat: StandardMaterial3D
var _glow_mat: StandardMaterial3D
var _core_mat: StandardMaterial3D
var _glow_base := Color(0.25, 1.0, 0.9)
var _glow_target := Color(0.25, 1.0, 0.9)
var _glow_energy := 1.6
var _boxes := {}
var _trails: Array[WeaponTrail] = []
var _shards: Array[Node3D] = []
var _ring: MeshInstance3D
var _ring_mat: StandardMaterial3D
var _head_point: Node3D
var _comet: CPUParticles3D

@onready var rig: Node3D = $Rig
@onready var anim: AnimationPlayer = $AnimationPlayer
@onready var hurtbox: Area3D = $Hurtbox


func _ready() -> void:
	add_to_group("enemy")
	_build_rig()
	var poses := POSES.duplicate()
	poses["sl_start"] = PoseAnim.mirror(POSES["sr_end"])
	poses["sl_wind"] = PoseAnim.mirror(POSES["sr_wind"])
	poses["sl_mid"] = PoseAnim.mirror(POSES["sr_mid"])
	poses["sl_end"] = PoseAnim.mirror(POSES["sr_end"])
	var lib := PoseAnim.build_library(anim.get_node(anim.root_node), joints, "hips", HIPS_REST, poses, ANIMS)
	anim.add_animation_library("", lib)
	anim.callback_mode_process = AnimationMixer.ANIMATION_CALLBACK_MODE_PROCESS_PHYSICS
	_play("idle", 0.0)
	Build.collect_meshes(rig, _meshes)
	_flash_mat = Build.flash_overlay(Color(1, 1, 1))
	for m in _meshes:
		m.material_overlay = _flash_mat
	hp = max_hp


func set_max_hp(v: float) -> void:
	max_hp = v
	hp = v
	health_changed.emit(hp, max_hp)


# ---------------------------------------------------------------- model

func _build_rig() -> void:
	var shell := Build.mat(Color(0.17, 0.1, 0.25), 0.28, 0.35)
	var shell_hi := Build.mat(Color(0.33, 0.19, 0.45), 0.3, 0.3)
	var belly := Build.mat(Color(0.42, 0.26, 0.46), 0.55, 0.05)
	var bone := Build.mat(Color(0.82, 0.78, 0.86), 0.25, 0.3)
	_glow_mat = Build.glow(_glow_base, _glow_energy)
	_core_mat = Build.glow(Color(0.7, 0.35, 1.0), 2.2)

	var hips := Build.joint(rig, "Hips", HIPS_REST)
	joints["hips"] = hips
	Build.part(hips, Build.ball(0.42, 10, 6), shell, Vector3.ZERO, Vector3.ZERO, Vector3(1.1, 0.8, 1.0))
	Build.part(hips, Build.ball(0.3, 8, 5), belly, Vector3(0, -0.12, -0.12))

	var spine := Build.joint(hips, "Spine", Vector3(0, 0.18, 0))
	joints["spine"] = spine
	# Broad upper carapace over a narrow waist.
	Build.part(spine, Build.ball(0.36, 10, 6), belly, Vector3(0, 0.22, -0.05), Vector3.ZERO, Vector3(1.0, 1.1, 0.9))
	Build.part(spine, Build.ball(0.62, 12, 8), shell, Vector3(0, 0.82, 0.02), Vector3.ZERO, Vector3(1.3, 0.85, 0.85))
	Build.part(spine, Build.ball(0.42, 10, 6), belly, Vector3(0, 0.7, -0.3), Vector3.ZERO, Vector3(1.05, 0.9, 0.6))
	# Glowing core and thin vein lines on the chest.
	Build.part(spine, Build.ball(0.12, 10, 6), _core_mat, Vector3(0, 0.74, -0.53))
	for i in 2:
		var y := 0.5 + i * 0.42
		Build.part(spine, Build.box(0.5 - i * 0.12, 0.022, 0.03), _glow_mat, Vector3(0, y, -0.5), Vector3(-15, 0, 0))
	# Back carapace plates and spikes.
	for i in 4:
		var y := 0.25 + i * 0.3
		Build.part(spine, Build.box(0.95 - i * 0.12, 0.2, 0.32), shell_hi, Vector3(0, y, 0.4 - i * 0.04), Vector3(-20, 0, 0))
		Build.part(spine, Build.box(0.7 - i * 0.1, 0.03, 0.05), _glow_mat, Vector3(0, y - 0.12, 0.56 - i * 0.04), Vector3(-20, 0, 0))
		var spike := Build.part(spine, Build.cyl(0.0, 0.1, 0.55 - i * 0.05, 5), bone, Vector3(0, y + 0.2, 0.55), Vector3(-55, 0, 0))
		spike.name = "Spike%d" % i
	for side: int in [1, -1]:
		Build.part(spine, Build.cyl(0.0, 0.12, 0.7, 5), bone, Vector3(0.55 * side, 1.15, 0.2), Vector3(-30, 0, -35 * side))

	var neck := Build.joint(spine, "Neck", Vector3(0, 1.1, -0.25))
	joints["neck"] = neck
	Build.part(neck, Build.cyl(0.18, 0.26, 0.4, 8), shell, Vector3(0, 0.12, -0.08), Vector3(-35, 0, 0))
	var head := Build.joint(neck, "Head", Vector3(0, 0.28, -0.22))
	joints["head"] = head
	Build.part(head, Build.ball(0.3, 10, 7), shell, Vector3(0, 0.05, -0.2), Vector3.ZERO, Vector3(0.95, 0.8, 1.6))
	Build.part(head, Build.ball(0.22, 8, 5), shell_hi, Vector3(0, 0.2, 0.08), Vector3.ZERO, Vector3(1.3, 0.75, 1.6))
	Build.part(head, Build.cyl(0.0, 0.1, 0.9, 5), bone, Vector3(0, 0.38, 0.38), Vector3(-70, 0, 0))
	for side: int in [1, -1]:
		Build.part(head, Build.cyl(0.0, 0.08, 0.95, 5), bone, Vector3(0.2 * side, 0.32, 0.36), Vector3(-62, 0, -22 * side))
		Build.part(head, Build.cyl(0.0, 0.05, 0.45, 5), bone, Vector3(0.3 * side, 0.12, 0.1), Vector3(-80, 0, -60 * side))
		Build.part(head, Build.ball(0.06, 8, 5), _glow_mat, Vector3(0.13 * side, 0.1, -0.55))
		Build.part(head, Build.ball(0.04, 8, 5), _glow_mat, Vector3(0.21 * side, 0.18, -0.45))
	var jaw := Build.joint(head, "Jaw", Vector3(0, -0.12, -0.1))
	joints["jaw"] = jaw
	Build.part(jaw, Build.ball(0.22, 8, 5), shell_hi, Vector3(0, -0.04, -0.25), Vector3.ZERO, Vector3(0.8, 0.45, 1.4))
	for side: int in [1, -1]:
		Build.part(jaw, Build.cyl(0.0, 0.05, 0.45, 5), bone, Vector3(0.15 * side, -0.05, -0.5), Vector3(-100, 0, 15 * side))
	_head_point = Build.joint(head, "HeadPoint", Vector3(0, 0.1, -0.4))

	for side: int in [1, -1]:
		var sfx := "_r" if side == 1 else "_l"
		var sh := Build.joint(spine, "Shoulder" + sfx, Vector3(0.72 * side, 0.95, -0.08))
		joints["sh" + sfx] = sh
		Build.part(sh, Build.ball(0.26, 8, 6), shell_hi, Vector3(0.05 * side, 0.05, 0), Vector3.ZERO, Vector3(1.2, 0.9, 1.1))
		Build.part(sh, Build.capsule(0.14, 0.95), shell, Vector3(0, -0.42, 0))
		var el := Build.joint(sh, "Elbow" + sfx, Vector3(0, -0.88, 0))
		joints["el" + sfx] = el
		Build.part(el, Build.ball(0.15, 8, 5), shell_hi)
		Build.part(el, Build.capsule(0.12, 0.85), shell, Vector3(0, -0.38, 0))
		Build.part(el, Build.box(0.04, 0.6, 0.04), _glow_mat, Vector3(0, -0.4, -0.12))
		var blade_root := Build.joint(el, "Blade" + sfx, Vector3(0, -0.8, 0))
		blade_root.rotation_degrees = Vector3(28, 0, 0)
		var blade := Build.part(blade_root, Build.prism(0.26, 1.45, 0.06, 0.15), bone, Vector3(0, -0.68, -0.02))
		blade.rotation_degrees = Vector3(0, 90, 180)
		Build.part(blade_root, Build.box(0.03, 1.3, 0.035), _glow_mat, Vector3(0, -0.66, -0.13))
		Build.part(blade_root, Build.ball(0.13, 8, 5), shell_hi, Vector3(0, 0.0, 0))
		var mark_a := Build.joint(blade_root, "TrailA", Vector3(0, -0.15, -0.1))
		var mark_b := Build.joint(blade_root, "TrailB", Vector3(0, -1.35, -0.12))
		var area := Area3D.new()
		area.name = "Hitbox" + sfx
		area.collision_layer = 0
		area.collision_mask = 8
		area.monitorable = false
		area.monitoring = false
		var cs := CollisionShape3D.new()
		var bs := BoxShape3D.new()
		bs.size = Vector3(0.45, 1.55, 0.55)
		cs.shape = bs
		cs.position = Vector3(0, -0.7, -0.05)
		area.add_child(cs)
		blade_root.add_child(area)
		_boxes["blade" + sfx] = area
		var tr := WeaponTrail.new()
		tr.setup(mark_a, mark_b, Color(0.35, 1.0, 0.9, 0.9))
		tr.lifetime = 0.18
		add_child(tr)
		_trails.append(tr)

	for side: int in [1, -1]:
		var sfx := "_r" if side == 1 else "_l"
		var hip := Build.joint(hips, "Hip" + sfx, Vector3(0.38 * side, -0.05, 0.05))
		joints["hip" + sfx] = hip
		Build.part(hip, Build.capsule(0.26, 0.95), shell, Vector3(0, -0.36, 0))
		Build.part(hip, Build.ball(0.24, 8, 5), shell_hi, Vector3(0.06 * side, -0.05, 0), Vector3.ZERO, Vector3(1.1, 0.9, 1.2))
		Build.part(hip, Build.box(0.04, 0.5, 0.04), _glow_mat, Vector3(0.12 * side, -0.4, -0.15))
		var knee := Build.joint(hip, "Knee" + sfx, Vector3(0, -0.8, 0))
		joints["knee" + sfx] = knee
		Build.part(knee, Build.ball(0.18, 8, 5), shell_hi)
		Build.part(knee, Build.cyl(0.0, 0.07, 0.4, 5), bone, Vector3(0, 0.1, -0.15), Vector3(-60, 0, 0))
		Build.part(knee, Build.capsule(0.15, 0.82), shell, Vector3(0, -0.36, 0))
		var ankle := Build.joint(knee, "Ankle" + sfx, Vector3(0, -0.75, 0))
		joints["ankle" + sfx] = ankle
		Build.part(ankle, Build.capsule(0.09, 0.48), shell_hi, Vector3(0, -0.2, 0))
		for c in 3:
			Build.part(ankle, Build.cyl(0.0, 0.06, 0.32, 4), bone, Vector3((c - 1) * 0.1, -0.42, -0.12), Vector3(-75, (c - 1) * 18.0, 0))

	var tail_parent: Node3D = hips
	var tail_pos := Vector3(0, 0.0, 0.38)
	for i in 3:
		var tj := Build.joint(tail_parent, "Tail%d" % (i + 1), tail_pos)
		joints["tail%d" % (i + 1)] = tj
		var r := 0.2 - i * 0.05
		Build.part(tj, Build.cyl(r * 0.7, r, 0.6, 6), shell, Vector3(0, 0, 0.3), Vector3(90, 0, 0))
		Build.part(tj, Build.box(0.03, 0.03, 0.5), _glow_mat, Vector3(0, r * 0.8, 0.3))
		tail_parent = tj
		tail_pos = Vector3(0, 0, 0.58)
	Build.part(tail_parent, Build.cyl(0.0, 0.08, 0.5, 5), bone, Vector3(0, 0, 0.8), Vector3(90, 0, 0))

	for i in 3:
		var holder := Node3D.new()
		rig.add_child(holder)
		holder.position = Vector3(0, 3.0, 0)
		var s := Build.part(holder, Build.ball(0.13, 4, 2), _glow_mat, Vector3(1.25, 0, 0), Vector3.ZERO, Vector3(0.7, 1.5, 0.7))
		s.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		holder.rotation.y = TAU * i / 3.0
		_shards.append(holder)

	var body := Area3D.new()
	body.name = "BodyHitbox"
	body.collision_layer = 0
	body.collision_mask = 8
	body.monitorable = false
	body.monitoring = false
	var bcs := CollisionShape3D.new()
	var sph := SphereShape3D.new()
	sph.radius = 1.25
	bcs.shape = sph
	bcs.position = Vector3(0, 1.6, -0.7)
	body.add_child(bcs)
	add_child(body)
	_boxes["body"] = body

	# Telegraph ring above the head: yellow = parryable, red = dodge it.
	_ring = MeshInstance3D.new()
	var q := QuadMesh.new()
	q.size = Vector2(1, 1)
	_ring.mesh = q
	_ring_mat = Build.fx(Color(1, 0.8, 0.2), true, false, Build.ring_tex())
	_ring_mat.billboard_mode = BaseMaterial3D.BILLBOARD_ENABLED
	_ring_mat.no_depth_test = true
	_ring_mat.render_priority = 5
	_ring.material_override = _ring_mat
	_ring.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	_ring.visible = false
	add_child(_ring)

	_comet = CPUParticles3D.new()
	_comet.amount = 90
	_comet.lifetime = 0.6
	_comet.emitting = false
	_comet.mesh = FX.quad_of(0.6)
	_comet.material_override = Build.fx(Color.WHITE)
	_comet.emission_shape = CPUParticles3D.EMISSION_SHAPE_SPHERE
	_comet.emission_sphere_radius = 1.0
	_comet.direction = Vector3.UP
	_comet.spread = 25.0
	_comet.initial_velocity_min = 2.0
	_comet.initial_velocity_max = 6.0
	_comet.gravity = Vector3.ZERO
	_comet.scale_amount_min = 0.5
	_comet.scale_amount_max = 1.5
	var cg := Gradient.new()
	cg.set_color(0, Color(0.6, 1.5, 1.5, 1))
	cg.set_color(1, Color(0.6, 0.3, 1.2, 0))
	_comet.color_ramp = cg
	_comet.position = Vector3(0, 1.8, 0)
	_comet.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	add_child(_comet)


# ---------------------------------------------------------------- helpers

func _play(anim_name: String, blend: float = 0.15, speed: float = 1.0, restart: bool = false) -> void:
	if anim_name == _anim_name and not restart and anim.is_playing():
		return
	_anim_name = anim_name
	anim.play(anim_name, blend, speed)
	if restart:
		anim.seek(0.0, true)


func facing() -> Vector3:
	var f := -global_transform.basis.z
	f.y = 0.0
	return f.normalized()


func _to_target() -> Vector3:
	if target == null:
		return Vector3.ZERO
	var d := target.global_position - global_position
	d.y = 0.0
	return d


func _turn_toward(dir: Vector3, rate: float, delta: float) -> void:
	if dir.length_squared() < 0.0001:
		return
	rotation.y = lerp_angle(rotation.y, atan2(-dir.x, -dir.z), 1.0 - exp(-rate * delta))


func can_be_finished() -> bool:
	return state == State.KNEEL


func is_attacking() -> bool:
	return state == State.ATTACK


func current_attack() -> String:
	return _atk if state == State.ATTACK else ""


func windup_remaining() -> float:
	if state != State.ATTACK:
		return INF
	return float(ATTACKS[_atk]["windup"]) - _atk_t


func active_remaining() -> float:
	if state != State.ATTACK:
		return -INF
	var spec: Dictionary = ATTACKS[_atk]
	return float(spec["windup"]) + float(spec["active"]) - _atk_t


func head_position() -> Vector3:
	return _head_point.global_position


func core_position() -> Vector3:
	return global_position + Vector3.UP * 2.2 + facing() * 0.5


# ---------------------------------------------------------------- simulation

func _physics_process(delta: float) -> void:
	_t += delta
	_state_t += delta
	_since_hit += delta
	_pressure = maxf(_pressure - delta * 0.5, 0.0)
	if _since_hit > 2.5 and poise > 0.0 and state != State.STAGGER:
		poise = maxf(poise - 18.0 * delta, 0.0)
		poise_changed.emit(poise, MAX_POISE)

	match state:
		State.INACTIVE, State.INTRO, State.DYING, State.DEAD:
			_secondary(delta)
			return
		State.STALK:
			_stalk(delta)
		State.ATTACK:
			_attack_step(delta)
		State.FLINCH:
			_slow_down(delta, 10.0)
			if _state_t >= 0.32:
				_to_stalk()
		State.RECOIL:
			_slow_down(delta, 8.0)
			if _state_t >= 0.85:
				_to_stalk()
		State.STAGGER:
			_slow_down(delta, 8.0)
			if _state_t >= STAGGER_TIME:
				poise = 0.0
				poise_changed.emit(poise, MAX_POISE)
				_to_stalk()
		State.KNEEL:
			_slow_down(delta, 10.0)

	if is_on_floor():
		velocity.y = maxf(velocity.y, -1.0)
	else:
		velocity.y -= GRAVITY * delta
	move_and_slide()
	_secondary(delta)


func _slow_down(delta: float, rate: float) -> void:
	velocity.x = move_toward(velocity.x, 0.0, rate * delta)
	velocity.z = move_toward(velocity.z, 0.0, rate * delta)


func _to_stalk() -> void:
	state = State.STALK
	_state_t = 0.0
	_cooldown = rng.randf_range(0.3, 0.8)


func _stalk(delta: float) -> void:
	var to_p := _to_target()
	var dist := to_p.length()
	_turn_toward(to_p, 4.5, delta)
	_cooldown -= delta
	var dir := to_p.normalized() if dist > 0.01 else facing()
	var want := Vector3.ZERO
	if target == null or not target.is_alive() or not ai_enabled:
		want = Vector3.ZERO
	elif dist > 3.3:
		want = dir * WALK_SPEED
	elif dist < 2.0:
		want = -dir * 1.4
	else:
		if rng.randf() < 0.004:
			_strafe = -_strafe
		want = dir.cross(Vector3.UP) * _strafe * 1.1
	velocity.x = move_toward(velocity.x, want.x, 12.0 * delta)
	velocity.z = move_toward(velocity.z, want.z, 12.0 * delta)
	if Vector2(velocity.x, velocity.z).length() > 0.5:
		_play("walk", 0.25)
		anim.speed_scale = 1.0
	else:
		_play("idle", 0.3)

	if not ai_enabled or target == null or not target.is_alive() or _cooldown > 0.0:
		return
	if dist <= 4.3:
		var roll := rng.randf()
		if roll < 0.5:
			start_attack("swipe_r", "swipe_l" if rng.randf() < 0.55 else "")
		elif roll < 0.8:
			start_attack("slam")
		else:
			start_attack("swipe_r")
	elif dist > 6.0 and dist < 11.0 and rng.randf() < 0.5:
		start_attack("lunge")
	else:
		_cooldown = 0.35


func start_attack(attack_name: String, follow_up: String = "") -> void:
	state = State.ATTACK
	_state_t = 0.0
	_atk = attack_name
	_atk_t = 0.0
	_atk_hit = false
	_combo_next = follow_up
	attack_id += 1
	var spec: Dictionary = ATTACKS[attack_name]
	var unblockable := not bool(spec["blockable"]) or not bool(spec["parryable"])
	_glow_target = Color(1.0, 0.25, 0.12) if unblockable else Color(1.0, 0.85, 0.3)
	_ring_mat.albedo_color = Color(1.6, 0.3, 0.15) if unblockable else Color(1.7, 1.3, 0.35)
	_ring.visible = true
	anim.speed_scale = 1.0
	_play(attack_name, 0.12, 1.0, true)
	if attack_name == "slam" or attack_name == "lunge":
		Sfx.play("roar", -8.0, 1.25)
	else:
		Sfx.play("screech", -10.0, 1.1)
	attack_started.emit(attack_name, unblockable)


func _attack_step(delta: float) -> void:
	var spec: Dictionary = ATTACKS[_atk]
	var windup: float = spec["windup"]
	var active_end: float = windup + float(spec["active"])
	var total: float = active_end + float(spec["recover"])
	var prev := _atk_t
	_atk_t += delta
	var to_p := _to_target()

	if _atk_t < windup - 0.12:
		_turn_toward(to_p, 5.0, delta)
	var k := clampf(_atk_t / windup, 0.0, 1.0)
	_ring.global_position = _head_point.global_position + Vector3.UP * 1.05
	_ring.scale = Vector3.ONE * lerpf(3.2, 0.9, k)
	_ring_mat.albedo_color.a = clampf(k * 3.0, 0.0, 1.0)

	if prev < windup and _atk_t >= windup:
		_ring.visible = false
		for b: String in spec["boxes"]:
			(_boxes[b] as Area3D).monitoring = true
		for tr in _trails:
			tr.emitting = _atk != "lunge"
		Sfx.play("whoosh_heavy", -2.0, 0.7)
		var f := facing()
		if spec.has("dash"):
			var dash: float = spec["dash"]
			var dist := to_p.length()
			var speed := clampf(dist * 2.2, 4.0, dash)
			velocity.x = f.x * speed
			velocity.z = f.z * speed
		else:
			var step: float = spec["step"]
			if to_p.length() < 2.4:
				step *= 0.2
			velocity.x = f.x * step
			velocity.z = f.z * step

	if _atk_t >= windup and _atk_t < active_end:
		if spec.has("dash") and to_p.length() < 1.6:
			velocity.x = move_toward(velocity.x, 0.0, 80.0 * delta)
			velocity.z = move_toward(velocity.z, 0.0, 80.0 * delta)
		if not _atk_hit:
			for b: String in spec["boxes"]:
				if _atk_hit:
					break
				for area: Area3D in (_boxes[b] as Area3D).get_overlapping_areas():
					if area.get_parent() == target:
						_hit_target(spec, (_boxes[b] as Area3D).global_position)
						break
	else:
		_slow_down(delta, 14.0)

	if prev < active_end and _atk_t >= active_end:
		for b: String in spec["boxes"]:
			(_boxes[b] as Area3D).monitoring = false
		for tr in _trails:
			tr.emitting = false
		if spec.has("aoe"):
			_slam_impact(spec)

	if _atk_t >= total:
		_glow_target = _glow_base
		if _combo_next != "" and target and target.is_alive():
			var nxt := _combo_next
			_combo_next = ""
			start_attack(nxt)
			return
		_to_stalk()


func _hit_target(spec: Dictionary, point: Vector3) -> void:
	_atk_hit = true
	var info := {
		"damage": float(spec["damage"]),
		"from": global_position,
		"point": point.lerp(target.global_position + Vector3.UP * 1.1, 0.6),
		"parryable": bool(spec["parryable"]),
		"blockable": bool(spec["blockable"]),
		"knockback": float(spec["knockback"]),
		"kind": _atk,
	}
	var result: String = target.receive_hit(info)
	if result == "parried":
		_on_parried()


func _slam_impact(spec: Dictionary) -> void:
	var center := global_position + facing() * 2.4
	center.y = 0.05
	if FX.inst:
		FX.inst.shockwave(center, Color(1.0, 0.35, 0.2), float(spec["aoe"]) * 1.2, 0.5)
		FX.inst.shockwave(center, Color(0.4, 1.0, 0.9), float(spec["aoe"]) * 0.8, 0.35)
		FX.inst.dust(center, 30, 5.0)
		FX.inst.burst(center + Vector3.UP * 0.2, Color(0.9, 0.55, 0.3), 30, 7.0, 0.7, 0.12, -14.0, false, Vector3.UP, 60.0)
		FX.inst.shake(0.75)
		FX.inst.impact_light(center + Vector3.UP, Color(1.0, 0.5, 0.3), 5.0, 0.3, 9.0)
	Sfx.play("boom", 0.0)
	if not _atk_hit and target and target.is_alive():
		var d := target.global_position - center
		d.y = 0.0
		if d.length() <= float(spec["aoe"]):
			_hit_target(spec, center)


func _on_parried() -> void:
	for b: String in _boxes:
		(_boxes[b] as Area3D).monitoring = false
	for tr in _trails:
		tr.emitting = false
	_combo_next = ""
	_glow_target = _glow_base
	_ring.visible = false
	poise += 45.0
	_since_hit = 0.0
	poise_changed.emit(poise, MAX_POISE)
	if poise >= MAX_POISE:
		_enter_stagger()
		return
	state = State.RECOIL
	_state_t = 0.0
	velocity = -facing() * 3.0
	_play("recoil", 0.05, 1.0, true)


func receive_hit(info: Dictionary) -> String:
	if state in [State.INACTIVE, State.INTRO, State.KNEEL, State.DYING, State.DEAD]:
		return "ignored"
	var dmg: float = info["damage"]
	if state == State.STAGGER:
		dmg *= 1.3
	hp = maxf(hp - dmg, 0.0)
	_since_hit = 0.0
	var point: Vector3 = info.get("point", global_position + Vector3.UP * 1.6)
	var from: Vector3 = info.get("from", point)
	var away := point - from
	away.y = 0.3
	var kind: String = info.get("kind", "light")
	var heavy := kind == "heavy" or kind == "light_finisher"
	if FX.inst:
		FX.inst.ichor(point, away, 34 if heavy else 22)
		FX.inst.sparks(point, Color(1.0, 0.75, 0.35), 20 if heavy else 12)
		FX.inst.impact_light(point, Color(0.4, 1.0, 0.9), 2.0 if heavy else 1.3, 0.15)
		FX.inst.hit_stop(0.11 if heavy else 0.06)
		FX.inst.shake(0.5 if heavy else 0.25)
		FX.inst.damage_number(point + Vector3.UP * 0.4, dmg, Color(1.0, 0.86, 0.45) if not heavy else Color(1.0, 0.6, 0.25), heavy)
	_flash()
	Sfx.play("hit_heavy" if heavy else "hit", -1.0 if heavy else -3.0)
	health_changed.emit(hp, max_hp)
	if hp <= 0.0:
		_enter_kneel()
		return "kill"
	if state == State.STAGGER:
		return "hit"
	poise += float(info.get("poise", 10.0))
	poise_changed.emit(poise, MAX_POISE)
	if poise >= MAX_POISE:
		_enter_stagger()
		return "stagger"
	# Hyper-armour: light hits only flinch it while it recovers from an attack;
	# heavy blows also flinch it out of stalking. Sustained pressure makes it
	# lash back with a quick counter swipe.
	var recovering := state == State.ATTACK and _atk_t > float(ATTACKS[_atk]["windup"]) + float(ATTACKS[_atk]["active"])
	_pressure += 1.0
	if (heavy and (state == State.STALK or state == State.FLINCH)) or recovering:
		_cancel_attack()
		state = State.FLINCH
		_state_t = 0.0
		velocity = -facing() * (2.5 if heavy else 1.2)
		_play("flinch", 0.04, 1.0, true)
		if rng.randf() < 0.4:
			Sfx.play("screech", -12.0, 1.3)
	elif state == State.STALK and ai_enabled and _pressure >= 3.0:
		_pressure = 0.0
		start_attack("swipe_l" if rng.randf() < 0.5 else "swipe_r")
	return "hit"


func _cancel_attack() -> void:
	for b: String in _boxes:
		(_boxes[b] as Area3D).monitoring = false
	for tr in _trails:
		tr.emitting = false
	_ring.visible = false
	_combo_next = ""
	_glow_target = _glow_base


func _enter_stagger() -> void:
	_cancel_attack()
	state = State.STAGGER
	_state_t = 0.0
	poise = MAX_POISE
	poise_changed.emit(poise, MAX_POISE)
	velocity = -facing() * 2.0
	_play("stagger", 0.08, 1.0, true)
	Sfx.play("roar", -4.0, 0.85)
	if FX.inst:
		FX.inst.burst(core_position(), Color(0.7, 0.4, 1.0), 36, 6.0, 0.6, 0.08, -6.0)
	staggered.emit()


func _enter_kneel() -> void:
	_cancel_attack()
	state = State.KNEEL
	_state_t = 0.0
	ai_enabled = false
	velocity = Vector3.ZERO
	_play("kneel", 0.1, 1.0, true)
	_glow_target = Color(1.0, 0.3, 0.6)
	Sfx.play("roar", -2.0, 0.7)
	defeated.emit()


func _flash() -> void:
	_flash_mat.albedo_color.a = 0.32
	var tw := create_tween()
	tw.tween_property(_flash_mat, "albedo_color:a", 0.0, 0.14)


func _secondary(delta: float) -> void:
	for i in _shards.size():
		var h := _shards[i]
		h.rotation.y += delta * 1.4
		h.position.y = 3.0 + sin(_t * 2.0 + i * 2.1) * 0.15
		if state == State.KNEEL:
			h.position.y = 1.9 + sin(_t * 2.0 + i) * 0.1
	var pulse := 1.0 + 0.25 * sin(_t * 4.0)
	var c := _glow_mat.emission.lerp(_glow_target, 1.0 - exp(-8.0 * delta))
	_glow_mat.emission = c
	var boost := 2.0 if _glow_target != _glow_base else 1.0
	_glow_mat.emission_energy_multiplier = _glow_energy * pulse * boost
	_core_mat.emission_energy_multiplier = 3.0 * pulse * (2.5 if state == State.STAGGER else 1.0)


# ---------------------------------------------------------------- intro & finisher

func begin_intro(land_at: Vector3) -> void:
	state = State.INTRO
	global_position = land_at + Vector3.UP * 28.0
	velocity = Vector3.ZERO
	_play("fall", 0.0)
	_comet.emitting = true


func land_intro() -> void:
	_comet.emitting = false
	_play("roar", 0.05, 1.0, true)


func start_fight() -> void:
	ai_enabled = true
	_to_stalk()
	_cooldown = 0.6


func begin_doom() -> void:
	state = State.DYING
	_cancel_attack()
	_play("doom", 0.05, 1.0, true)
	_glow_target = Color(1.0, 1.0, 1.0)


func disintegrate(duration: float) -> void:
	if FX.inst:
		var p := FX.inst.burst(global_position + Vector3.UP * 1.4, Color(0.4, 0.95, 0.9), 120, 5.0, 2.0, 0.07, 3.5, false, Vector3.UP, 70.0)
		p.emission_shape = CPUParticles3D.EMISSION_SHAPE_SPHERE
		p.emission_sphere_radius = 1.2
		p.explosiveness = 0.4
		var p2 := FX.inst.burst(global_position + Vector3.UP * 1.4, Color(0.7, 0.4, 0.95), 60, 3.0, 2.2, 0.09, 2.0, false, Vector3.UP, 90.0)
		p2.emission_shape = CPUParticles3D.EMISSION_SHAPE_SPHERE
		p2.emission_sphere_radius = 1.3
		p2.explosiveness = 0.3
	var tw := create_tween().set_parallel(true)
	tw.tween_property(rig, "scale", Vector3(1.15, 0.02, 1.15), duration).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_IN)
	tw.tween_property(_glow_mat, "emission_energy_multiplier", 8.0, duration * 0.5)
	tw.chain().tween_callback(_finish_death)


func _finish_death() -> void:
	state = State.DEAD
	rig.visible = false
	collision_layer = 0
	hurtbox.set_deferred("monitorable", false)
	died.emit()

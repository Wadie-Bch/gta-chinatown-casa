class_name Warrior
extends CharacterBody3D
## The player: Idir, an original Amazigh-inspired warrior of the Atlas,
## armed with a bronze bearded axe and a painted round shield.

signal health_changed(current: float, maximum: float)
signal died
signal landed_hit(result: String, damage: float)
signal defended(kind: String)
signal finisher_requested

enum State { FREE, ATTACK, DODGE, HIT, DEAD, CINEMATIC }

const MAX_HP := 100.0
const RUN_SPEED := 5.6
const BLOCK_SPEED := 1.7
const ACCEL := 34.0
const GRAVITY := 22.0
const DODGE_SPEED := 10.5
const DODGE_TIME := 0.5
const IFRAME_START := 0.02
const IFRAME_END := 0.4
const PARRY_WINDOW := 0.24
const BLOCK_ARC_DOT := 0.3
const BUFFER_TIME := 0.38
const FINISH_RANGE := 4.2
const HIPS_REST := Vector3(0, 0.98, 0)

## Timings in seconds. Animation keys below line up with windup/active/recover.
const ATTACKS := {
	"light1": {"windup": 0.12, "active": 0.12, "recover": 0.26, "damage": 18.0, "poise": 9.0, "lunge": 4.0, "next": "light2", "kind": "light"},
	"light2": {"windup": 0.10, "active": 0.12, "recover": 0.26, "damage": 20.0, "poise": 9.0, "lunge": 4.0, "next": "light3", "kind": "light"},
	"light3": {"windup": 0.20, "active": 0.14, "recover": 0.38, "damage": 30.0, "poise": 16.0, "lunge": 6.0, "next": "", "kind": "light_finisher"},
	"heavy": {"windup": 0.42, "active": 0.14, "recover": 0.50, "damage": 48.0, "poise": 38.0, "lunge": 5.5, "next": "", "kind": "heavy"},
}

const POSES := {
	"idle_a": {"root": Vector3(0, -0.05, 0), "hips": Vector3(0, 18, 0), "spine": Vector3(-6, -16, 0), "head": Vector3(0, -4, 0),
		"sh_r": Vector3(18, 0, 16), "el_r": Vector3(80, 0, 0), "hand_r": Vector3(-10, 0, 0),
		"sh_l": Vector3(40, 26, -10), "el_l": Vector3(72, 0, 0),
		"hip_r": Vector3(-14, 0, 6), "knee_r": Vector3(-20, 0, 0), "hip_l": Vector3(24, 0, -6), "knee_l": Vector3(-26, 0, 0)},
	"idle_b": {"root": Vector3(0, -0.07, 0), "hips": Vector3(0, 18, 0), "spine": Vector3(-9, -17, 0), "head": Vector3(2, -4, 0),
		"sh_r": Vector3(21, 0, 17), "el_r": Vector3(84, 0, 0), "hand_r": Vector3(-12, 0, 0),
		"sh_l": Vector3(43, 26, -11), "el_l": Vector3(75, 0, 0),
		"hip_r": Vector3(-15, 0, 6), "knee_r": Vector3(-24, 0, 0), "hip_l": Vector3(26, 0, -6), "knee_l": Vector3(-30, 0, 0)},
	"run_a": {"root": Vector3(0, -0.07, 0), "hips": Vector3(0, -8, 0), "spine": Vector3(-18, 8, 0), "head": Vector3(12, 0, 0),
		"sh_r": Vector3(-8, 0, 14), "el_r": Vector3(72, 0, 0), "hand_r": Vector3(-20, 0, 0),
		"sh_l": Vector3(42, 24, -10), "el_l": Vector3(78, 0, 0),
		"hip_r": Vector3(40, 0, 0), "knee_r": Vector3(-14, 0, 0), "hip_l": Vector3(-32, 0, 0), "knee_l": Vector3(-58, 0, 0)},
	"run_b": {"root": Vector3(0, -0.0, 0), "hips": Vector3(0, 0, 0), "spine": Vector3(-16, 0, 0), "head": Vector3(10, 0, 0),
		"sh_r": Vector3(8, 0, 14), "el_r": Vector3(74, 0, 0), "hand_r": Vector3(-20, 0, 0),
		"sh_l": Vector3(42, 24, -10), "el_l": Vector3(78, 0, 0),
		"hip_r": Vector3(0, 0, 0), "knee_r": Vector3(-22, 0, 0), "hip_l": Vector3(14, 0, 0), "knee_l": Vector3(-100, 0, 0)},
	"run_c": {"root": Vector3(0, -0.07, 0), "hips": Vector3(0, 8, 0), "spine": Vector3(-18, -8, 0), "head": Vector3(12, 0, 0),
		"sh_r": Vector3(28, 0, 14), "el_r": Vector3(76, 0, 0), "hand_r": Vector3(-20, 0, 0),
		"sh_l": Vector3(38, 24, -10), "el_l": Vector3(78, 0, 0),
		"hip_l": Vector3(40, 0, 0), "knee_l": Vector3(-14, 0, 0), "hip_r": Vector3(-32, 0, 0), "knee_r": Vector3(-58, 0, 0)},
	"run_d": {"root": Vector3(0, -0.0, 0), "hips": Vector3(0, 0, 0), "spine": Vector3(-16, 0, 0), "head": Vector3(10, 0, 0),
		"sh_r": Vector3(14, 0, 14), "el_r": Vector3(74, 0, 0), "hand_r": Vector3(-20, 0, 0),
		"sh_l": Vector3(42, 24, -10), "el_l": Vector3(78, 0, 0),
		"hip_l": Vector3(0, 0, 0), "knee_l": Vector3(-22, 0, 0), "hip_r": Vector3(14, 0, 0), "knee_r": Vector3(-100, 0, 0)},
	"l1_wind": {"root": Vector3(0, -0.1, 0), "hips": Vector3(0, -22, 0), "spine": Vector3(-8, -38, 0), "head": Vector3(0, 34, 0),
		"sh_r": Vector3(75, -100, 0), "el_r": Vector3(50, 0, 0), "hand_r": Vector3(-60, 0, 0),
		"sh_l": Vector3(50, 40, -15), "el_l": Vector3(70, 0, 0),
		"hip_r": Vector3(-12, 0, 10), "knee_r": Vector3(-22, 0, 0), "hip_l": Vector3(28, 0, -8), "knee_l": Vector3(-34, 0, 0)},
	"l1_mid": {"root": Vector3(0, -0.13, 0), "hips": Vector3(0, 0, 0), "spine": Vector3(-12, 0, 0), "head": Vector3(0, 0, 0),
		"sh_r": Vector3(82, -15, 0), "el_r": Vector3(18, 0, 0), "hand_r": Vector3(-70, 0, 0),
		"sh_l": Vector3(40, 30, -20), "el_l": Vector3(65, 0, 0),
		"hip_r": Vector3(-18, 0, 10), "knee_r": Vector3(-26, 0, 0), "hip_l": Vector3(34, 0, -8), "knee_l": Vector3(-38, 0, 0)},
	"l1_end": {"root": Vector3(0, -0.12, 0), "hips": Vector3(0, 26, 0), "spine": Vector3(-14, 44, 0), "head": Vector3(0, -30, 0),
		"sh_r": Vector3(75, 80, 0), "el_r": Vector3(28, 0, 0), "hand_r": Vector3(-55, 0, 0),
		"sh_l": Vector3(20, 30, -40), "el_l": Vector3(55, 0, 0),
		"hip_r": Vector3(-18, 0, 10), "knee_r": Vector3(-26, 0, 0), "hip_l": Vector3(34, 0, -8), "knee_l": Vector3(-38, 0, 0)},
	"l1_rec": {"root": Vector3(0, -0.07, 0), "hips": Vector3(0, 16, 0), "spine": Vector3(-8, 8, 0), "head": Vector3(0, -8, 0),
		"sh_r": Vector3(40, 30, 10), "el_r": Vector3(62, 0, 0), "hand_r": Vector3(-25, 0, 0),
		"sh_l": Vector3(36, 28, -12), "el_l": Vector3(70, 0, 0),
		"hip_r": Vector3(-14, 0, 6), "knee_r": Vector3(-22, 0, 0), "hip_l": Vector3(26, 0, -6), "knee_l": Vector3(-28, 0, 0)},
	"l2_wind": {"root": Vector3(0, -0.1, 0), "hips": Vector3(0, 28, 0), "spine": Vector3(-10, 48, 0), "head": Vector3(0, -36, 0),
		"sh_r": Vector3(70, 100, 10), "el_r": Vector3(80, 0, 0), "hand_r": Vector3(-30, 0, 0),
		"sh_l": Vector3(25, 30, -40), "el_l": Vector3(55, 0, 0),
		"hip_r": Vector3(-14, 0, 8), "knee_r": Vector3(-24, 0, 0), "hip_l": Vector3(30, 0, -8), "knee_l": Vector3(-34, 0, 0)},
	"l2_mid": {"root": Vector3(0, -0.13, 0), "hips": Vector3(0, 0, 0), "spine": Vector3(-14, 0, 0), "head": Vector3(0, 0, 0),
		"sh_r": Vector3(84, 12, 0), "el_r": Vector3(16, 0, 0), "hand_r": Vector3(-75, 0, 0),
		"sh_l": Vector3(40, 30, -20), "el_l": Vector3(65, 0, 0),
		"hip_r": Vector3(-18, 0, 10), "knee_r": Vector3(-26, 0, 0), "hip_l": Vector3(34, 0, -8), "knee_l": Vector3(-38, 0, 0)},
	"l2_end": {"root": Vector3(0, -0.12, 0), "hips": Vector3(0, -24, 0), "spine": Vector3(-14, -42, 0), "head": Vector3(0, 32, 0),
		"sh_r": Vector3(80, -88, 0), "el_r": Vector3(22, 0, 0), "hand_r": Vector3(-62, 0, 0),
		"sh_l": Vector3(50, 40, -12), "el_l": Vector3(70, 0, 0),
		"hip_r": Vector3(-18, 0, 10), "knee_r": Vector3(-26, 0, 0), "hip_l": Vector3(34, 0, -8), "knee_l": Vector3(-38, 0, 0)},
	"l2_rec": {"root": Vector3(0, -0.07, 0), "hips": Vector3(0, -4, 0), "spine": Vector3(-8, -18, 0), "head": Vector3(0, 10, 0),
		"sh_r": Vector3(34, -20, 18), "el_r": Vector3(66, 0, 0), "hand_r": Vector3(-25, 0, 0),
		"sh_l": Vector3(42, 30, -11), "el_l": Vector3(72, 0, 0),
		"hip_r": Vector3(-14, 0, 6), "knee_r": Vector3(-22, 0, 0), "hip_l": Vector3(26, 0, -6), "knee_l": Vector3(-28, 0, 0)},
	"l3_wind": {"root": Vector3(0, -0.03, 0), "hips": Vector3(0, 8, 0), "spine": Vector3(14, -8, 0), "head": Vector3(12, 0, 0),
		"sh_r": Vector3(172, -8, 10), "el_r": Vector3(58, 0, 0), "hand_r": Vector3(-20, 0, 0),
		"sh_l": Vector3(60, 20, -30), "el_l": Vector3(50, 0, 0),
		"hip_r": Vector3(-20, 0, 6), "knee_r": Vector3(-16, 0, 0), "hip_l": Vector3(32, 0, -6), "knee_l": Vector3(-22, 0, 0)},
	"l3_mid": {"root": Vector3(0, -0.1, 0), "hips": Vector3(0, 4, 0), "spine": Vector3(-14, -4, 0), "head": Vector3(0, 0, 0),
		"sh_r": Vector3(112, -6, 6), "el_r": Vector3(12, 0, 0), "hand_r": Vector3(-30, 0, 0),
		"sh_l": Vector3(40, 15, -35), "el_l": Vector3(40, 0, 0),
		"hip_r": Vector3(-28, 0, 6), "knee_r": Vector3(-34, 0, 0), "hip_l": Vector3(45, 0, -6), "knee_l": Vector3(-50, 0, 0)},
	"l3_end": {"root": Vector3(0, -0.24, 0), "hips": Vector3(0, 0, 0), "spine": Vector3(-36, 0, 0), "head": Vector3(-8, 0, 0),
		"sh_r": Vector3(48, 0, 6), "el_r": Vector3(0, 0, 0), "hand_r": Vector3(-50, 0, 0),
		"sh_l": Vector3(20, 10, -40), "el_l": Vector3(30, 0, 0),
		"hip_r": Vector3(-36, 0, 6), "knee_r": Vector3(-52, 0, 0), "hip_l": Vector3(58, 0, -6), "knee_l": Vector3(-74, 0, 0)},
	"hv_wind": {"root": Vector3(0, 0.04, 0), "hips": Vector3(0, 0, 0), "spine": Vector3(22, 0, 0), "head": Vector3(16, 0, 0),
		"sh_r": Vector3(195, -5, 12), "el_r": Vector3(62, 0, 0), "hand_r": Vector3(-10, 0, 0),
		"sh_l": Vector3(160, 10, -22), "el_l": Vector3(50, 0, 0),
		"hip_r": Vector3(-12, 0, 8), "knee_r": Vector3(-12, 0, 0), "hip_l": Vector3(22, 0, -8), "knee_l": Vector3(-18, 0, 0)},
	"hv_mid": {"root": Vector3(0, -0.06, 0), "hips": Vector3(0, 0, 0), "spine": Vector3(-16, 0, 0), "head": Vector3(0, 0, 0),
		"sh_r": Vector3(122, 0, 6), "el_r": Vector3(10, 0, 0), "hand_r": Vector3(-30, 0, 0),
		"sh_l": Vector3(100, 10, -22), "el_l": Vector3(20, 0, 0),
		"hip_r": Vector3(-24, 0, 8), "knee_r": Vector3(-34, 0, 0), "hip_l": Vector3(44, 0, -8), "knee_l": Vector3(-50, 0, 0)},
	"hv_end": {"root": Vector3(0, -0.34, 0), "hips": Vector3(0, 0, 0), "spine": Vector3(-46, 0, 0), "head": Vector3(-14, 0, 0),
		"sh_r": Vector3(42, 0, 4), "el_r": Vector3(0, 0, 0), "hand_r": Vector3(-55, 0, 0),
		"sh_l": Vector3(30, 10, -30), "el_l": Vector3(20, 0, 0),
		"hip_r": Vector3(-40, 0, 8), "knee_r": Vector3(-72, 0, 0), "hip_l": Vector3(76, 0, -8), "knee_l": Vector3(-88, 0, 0)},
	"block": {"root": Vector3(0, -0.15, 0), "hips": Vector3(0, 12, 0), "spine": Vector3(-14, -12, 0), "head": Vector3(-6, 0, 0),
		"sh_r": Vector3(10, 0, 26), "el_r": Vector3(92, 0, 0), "hand_r": Vector3(-10, 0, 0),
		"sh_l": Vector3(78, 50, -18), "el_l": Vector3(96, 0, 0),
		"hip_r": Vector3(-22, 0, 10), "knee_r": Vector3(-36, 0, 0), "hip_l": Vector3(32, 0, -10), "knee_l": Vector3(-42, 0, 0)},
	"block_hit": {"root": Vector3(0, -0.1, 0), "hips": Vector3(0, 12, 0), "spine": Vector3(2, -12, 0), "head": Vector3(10, 0, 0),
		"sh_r": Vector3(0, 0, 32), "el_r": Vector3(80, 0, 0), "hand_r": Vector3(-10, 0, 0),
		"sh_l": Vector3(70, 50, -18), "el_l": Vector3(100, 0, 0),
		"hip_r": Vector3(-26, 0, 10), "knee_r": Vector3(-30, 0, 0), "hip_l": Vector3(26, 0, -10), "knee_l": Vector3(-36, 0, 0)},
	"hit": {"root": Vector3(0, -0.1, 0), "hips": Vector3(0, 10, 0), "spine": Vector3(20, 14, 0), "head": Vector3(24, 10, 0),
		"sh_r": Vector3(-12, 0, 42), "el_r": Vector3(40, 0, 0), "hand_r": Vector3(0, 0, 0),
		"sh_l": Vector3(14, 0, -42), "el_l": Vector3(40, 0, 0),
		"hip_r": Vector3(-18, 0, 6), "knee_r": Vector3(-26, 0, 0), "hip_l": Vector3(22, 0, -6), "knee_l": Vector3(-32, 0, 0)},
	"death_a": {"root": Vector3(0, -0.46, 0), "hips": Vector3(0, 0, 0), "spine": Vector3(-30, 0, 0), "head": Vector3(-28, 0, 0),
		"sh_r": Vector3(8, 0, 18), "el_r": Vector3(25, 0, 0), "sh_l": Vector3(8, 0, -18), "el_l": Vector3(25, 0, 0),
		"hip_r": Vector3(4, 0, 6), "knee_r": Vector3(-92, 0, 0), "hip_l": Vector3(4, 0, -6), "knee_l": Vector3(-92, 0, 0)},
	"death_b": {"root": Vector3(0, -0.8, 0), "hips": Vector3(-72, 0, 14), "spine": Vector3(-14, 0, 0), "head": Vector3(-10, 20, 0),
		"sh_r": Vector3(150, 0, 30), "el_r": Vector3(10, 0, 0), "sh_l": Vector3(40, 0, -60), "el_l": Vector3(20, 0, 0),
		"hip_r": Vector3(30, 0, 6), "knee_r": Vector3(-60, 0, 0), "hip_l": Vector3(10, 0, -6), "knee_l": Vector3(-40, 0, 0)},
	"roll_0": {"root": Vector3(0, -0.28, 0), "hips": Vector3(-24, 0, 0), "spine": Vector3(-34, 0, 0), "head": Vector3(-30, 0, 0),
		"sh_r": Vector3(50, 0, 22), "el_r": Vector3(100, 0, 0), "hand_r": Vector3(-20, 0, 0),
		"sh_l": Vector3(60, 30, -10), "el_l": Vector3(100, 0, 0),
		"hip_r": Vector3(62, 0, 0), "knee_r": Vector3(-100, 0, 0), "hip_l": Vector3(62, 0, 0), "knee_l": Vector3(-100, 0, 0)},
	"roll_1": {"root": Vector3(0, -0.5, 0), "hips": Vector3(-125, 0, 0), "spine": Vector3(-40, 0, 0), "head": Vector3(-35, 0, 0),
		"sh_r": Vector3(60, 0, 22), "el_r": Vector3(110, 0, 0), "hand_r": Vector3(-20, 0, 0),
		"sh_l": Vector3(60, 30, -10), "el_l": Vector3(110, 0, 0),
		"hip_r": Vector3(90, 0, 0), "knee_r": Vector3(-125, 0, 0), "hip_l": Vector3(90, 0, 0), "knee_l": Vector3(-125, 0, 0)},
	"roll_2": {"root": Vector3(0, -0.56, 0), "hips": Vector3(-235, 0, 0), "spine": Vector3(-40, 0, 0), "head": Vector3(-35, 0, 0),
		"sh_r": Vector3(60, 0, 22), "el_r": Vector3(110, 0, 0), "hand_r": Vector3(-20, 0, 0),
		"sh_l": Vector3(60, 30, -10), "el_l": Vector3(110, 0, 0),
		"hip_r": Vector3(95, 0, 0), "knee_r": Vector3(-130, 0, 0), "hip_l": Vector3(95, 0, 0), "knee_l": Vector3(-130, 0, 0)},
	"roll_3": {"root": Vector3(0, -0.3, 0), "hips": Vector3(-318, 8, 0), "spine": Vector3(-26, -8, 0), "head": Vector3(-15, 0, 0),
		"sh_r": Vector3(40, 0, 20), "el_r": Vector3(95, 0, 0), "hand_r": Vector3(-15, 0, 0),
		"sh_l": Vector3(50, 28, -10), "el_l": Vector3(90, 0, 0),
		"hip_r": Vector3(40, 0, 4), "knee_r": Vector3(-80, 0, 0), "hip_l": Vector3(60, 0, -4), "knee_l": Vector3(-90, 0, 0)},
	"roll_4": {"root": Vector3(0, -0.05, 0), "hips": Vector3(-360, 18, 0), "spine": Vector3(-6, -16, 0), "head": Vector3(0, -4, 0),
		"sh_r": Vector3(18, 0, 16), "el_r": Vector3(80, 0, 0), "hand_r": Vector3(-10, 0, 0),
		"sh_l": Vector3(40, 26, -10), "el_l": Vector3(72, 0, 0),
		"hip_r": Vector3(-14, 0, 6), "knee_r": Vector3(-20, 0, 0), "hip_l": Vector3(24, 0, -6), "knee_l": Vector3(-26, 0, 0)},
	"fin_crouch": {"root": Vector3(0, -0.32, 0), "hips": Vector3(0, 0, 0), "spine": Vector3(-26, 0, 0), "head": Vector3(10, 0, 0),
		"sh_r": Vector3(-35, 0, 22), "el_r": Vector3(60, 0, 0), "hand_r": Vector3(-20, 0, 0),
		"sh_l": Vector3(30, 30, -24), "el_l": Vector3(60, 0, 0),
		"hip_r": Vector3(36, 0, 6), "knee_r": Vector3(-90, 0, 0), "hip_l": Vector3(62, 0, -6), "knee_l": Vector3(-92, 0, 0)},
	"fin_air": {"root": Vector3(0, 1.25, 0), "hips": Vector3(0, 0, 0), "spine": Vector3(22, 0, 0), "head": Vector3(14, 0, 0),
		"sh_r": Vector3(200, 0, 10), "el_r": Vector3(72, 0, 0), "hand_r": Vector3(-10, 0, 0),
		"sh_l": Vector3(165, 0, -26), "el_l": Vector3(50, 0, 0),
		"hip_r": Vector3(30, 0, 6), "knee_r": Vector3(-100, 0, 0), "hip_l": Vector3(72, 0, -6), "knee_l": Vector3(-110, 0, 0)},
	"fin_strike": {"root": Vector3(0, 0.3, 0), "hips": Vector3(0, 0, 0), "spine": Vector3(-46, 0, 0), "head": Vector3(-8, 0, 0),
		"sh_r": Vector3(62, 0, 5), "el_r": Vector3(4, 0, 0), "hand_r": Vector3(-45, 0, 0),
		"sh_l": Vector3(40, 0, -40), "el_l": Vector3(20, 0, 0),
		"hip_r": Vector3(-10, 0, 6), "knee_r": Vector3(-40, 0, 0), "hip_l": Vector3(60, 0, -6), "knee_l": Vector3(-62, 0, 0)},
	"fin_hold": {"root": Vector3(0, -0.36, 0), "hips": Vector3(0, 0, 0), "spine": Vector3(-40, 0, 0), "head": Vector3(-4, 0, 0),
		"sh_r": Vector3(46, 0, 5), "el_r": Vector3(0, 0, 0), "hand_r": Vector3(-50, 0, 0),
		"sh_l": Vector3(26, 10, -44), "el_l": Vector3(26, 0, 0),
		"hip_r": Vector3(-32, 0, 8), "knee_r": Vector3(-80, 0, 0), "hip_l": Vector3(80, 0, -8), "knee_l": Vector3(-100, 0, 0)},
	"fin_rise": {"root": Vector3(0, -0.03, 0), "hips": Vector3(0, 10, 0), "spine": Vector3(-2, -10, 0), "head": Vector3(6, -4, 0),
		"sh_r": Vector3(16, 0, 18), "el_r": Vector3(60, 0, 0), "hand_r": Vector3(-10, 0, 0),
		"sh_l": Vector3(30, 20, -14), "el_l": Vector3(60, 0, 0),
		"hip_r": Vector3(-10, 0, 6), "knee_r": Vector3(-12, 0, 0), "hip_l": Vector3(14, 0, -6), "knee_l": Vector3(-14, 0, 0)},
	"victory": {"root": Vector3(0, 0.0, 0), "hips": Vector3(0, 0, 0), "spine": Vector3(8, 0, 0), "head": Vector3(16, 0, 0),
		"sh_r": Vector3(172, 0, 22), "el_r": Vector3(16, 0, 0), "hand_r": Vector3(-10, 0, 0),
		"sh_l": Vector3(28, 0, -50), "el_l": Vector3(24, 0, 0),
		"hip_r": Vector3(-4, 0, 10), "knee_r": Vector3(-5, 0, 0), "hip_l": Vector3(4, 0, -10), "knee_l": Vector3(-5, 0, 0)},
}

const ANIMS := {
	"idle": {"len": 1.8, "loop": true, "keys": [[0.0, "idle_a"], [0.9, "idle_b"], [1.8, "idle_a"]]},
	"run": {"len": 0.62, "loop": true, "keys": [[0.0, "run_a"], [0.155, "run_b"], [0.31, "run_c"], [0.465, "run_d"], [0.62, "run_a"]]},
	"block": {"len": 0.12, "keys": [[0.0, "block"], [0.12, "block"]]},
	"block_hit": {"len": 0.3, "keys": [[0.0, "block"], [0.06, "block_hit"], [0.3, "block"]]},
	"light1": {"len": 0.5, "keys": [[0.0, "idle_a"], [0.12, "l1_wind"], [0.18, "l1_mid"], [0.24, "l1_end"], [0.5, "l1_rec"]]},
	"light2": {"len": 0.48, "keys": [[0.0, "l1_end"], [0.10, "l2_wind"], [0.16, "l2_mid"], [0.22, "l2_end"], [0.48, "l2_rec"]]},
	"light3": {"len": 0.72, "keys": [[0.0, "l2_end"], [0.2, "l3_wind"], [0.27, "l3_mid"], [0.34, "l3_end"], [0.72, "idle_a"]]},
	"heavy": {"len": 1.06, "keys": [[0.0, "idle_a"], [0.42, "hv_wind"], [0.49, "hv_mid"], [0.56, "hv_end"], [0.8, "hv_end"], [1.06, "idle_a"]]},
	"roll": {"len": 0.5, "keys": [[0.0, "roll_0"], [0.12, "roll_1"], [0.25, "roll_2"], [0.38, "roll_3"], [0.5, "roll_4"]]},
	"hit": {"len": 0.36, "keys": [[0.0, "idle_a"], [0.07, "hit"], [0.36, "idle_a"]]},
	"death": {"len": 1.3, "keys": [[0.0, "hit"], [0.4, "death_a"], [1.3, "death_b"]]},
	"finisher": {"len": 1.5, "keys": [[0.0, "idle_a"], [0.16, "fin_crouch"], [0.42, "fin_air"], [0.6, "fin_strike"], [1.0, "fin_hold"], [1.5, "fin_rise"]]},
	"victory": {"len": 1.4, "keys": [[0.0, "fin_rise"], [0.5, "victory"], [1.4, "victory"]]},
}

var hp := MAX_HP
var state := State.FREE
var locked := true
var enemy: StarEater
var camera_rig: CameraRig
var joints := {}

var _attack := ""
var _attack_t := 0.0
var _attack_targets := {}
var _queued := ""
var _queue_t := 0.0
var _state_t := 0.0
var _dodge_dir := Vector3.ZERO
var _blocking := false
var _block_t := 0.0
var _grace := 0.0
var _step_t := 0.0
var _cloth_t := 0.0
var _anim_name := ""
var _meshes: Array[MeshInstance3D] = []
var _flash_mat: StandardMaterial3D
var _cape: Node3D
var _wrap_tail: Node3D
var _shield: Node3D
var _axe_head: Node3D

@onready var rig: Node3D = $Rig
@onready var anim: AnimationPlayer = $AnimationPlayer
@onready var hurtbox: Area3D = $Hurtbox
var weapon_box: Area3D
var trail: WeaponTrail


func _ready() -> void:
	add_to_group("player")
	_build_rig()
	var lib := PoseAnim.build_library(anim.get_node(anim.root_node), joints, "hips", HIPS_REST, POSES, ANIMS)
	anim.add_animation_library("", lib)
	anim.callback_mode_process = AnimationMixer.ANIMATION_CALLBACK_MODE_PROCESS_PHYSICS
	_calibrate_shield()
	_play("idle", 0.0)
	Build.collect_meshes(rig, _meshes)
	_flash_mat = Build.flash_overlay(Color(1.0, 0.25, 0.15))
	for m in _meshes:
		m.material_overlay = _flash_mat
	health_changed.emit(hp, MAX_HP)


# ---------------------------------------------------------------- model

func _build_rig() -> void:
	var skin := Build.mat(Color(0.55, 0.35, 0.23), 0.72)
	var indigo := Build.mat(Color(0.08, 0.13, 0.38), 0.9)
	var indigo_dark := Build.mat(Color(0.05, 0.07, 0.2), 0.92)
	var cape_blue := Build.mat(Color(0.09, 0.19, 0.55), 0.88)
	var terracotta := Build.mat(Color(0.72, 0.28, 0.14), 0.85)
	var bronze := Build.mat(Color(0.86, 0.58, 0.26), 0.38, 0.62)
	var edge := Build.mat(Color(0.98, 0.76, 0.42), 0.22, 0.75)
	var leather := Build.mat(Color(0.32, 0.19, 0.1), 0.8)
	var wood := Build.mat(Color(0.36, 0.22, 0.12), 0.7)
	var dark := Build.mat(Color(0.05, 0.03, 0.02), 0.6)

	rig.scale = Vector3.ONE * 1.08
	var hips := Build.joint(rig, "Hips", HIPS_REST)
	joints["hips"] = hips
	Build.part(hips, Build.box(0.34, 0.2, 0.24), leather)
	Build.part(hips, Build.cyl(0.2, 0.31, 0.44, 8), indigo, Vector3(0, -0.2, 0))
	Build.part(hips, Build.cyl(0.313, 0.318, 0.07, 8), terracotta, Vector3(0, -0.39, 0))
	Build.part(hips, Build.cyl(0.216, 0.216, 0.09, 8), terracotta, Vector3(0, 0.06, 0))
	Build.part(hips, Build.box(0.1, 0.1, 0.04), bronze, Vector3(0, 0.06, -0.21), Vector3(0, 0, 45))

	var spine := Build.joint(hips, "Spine", Vector3(0, 0.1, 0))
	joints["spine"] = spine
	Build.part(spine, Build.cyl(0.26, 0.2, 0.52, 8), indigo, Vector3(0, 0.26, 0), Vector3.ZERO, Vector3(1, 1, 0.72))
	Build.part(spine, Build.box(0.38, 0.26, 0.06), bronze, Vector3(0, 0.34, -0.17), Vector3(-6, 0, 0))
	Build.part(spine, Build.box(0.09, 0.09, 0.02), terracotta, Vector3(0, 0.34, -0.205), Vector3(-6, 0, 45))
	Build.part(spine, Build.box(0.05, 0.05, 0.02), bronze, Vector3(-0.12, 0.34, -0.205), Vector3(-6, 0, 45))
	Build.part(spine, Build.box(0.05, 0.05, 0.02), bronze, Vector3(0.12, 0.34, -0.205), Vector3(-6, 0, 45))
	Build.part(spine, Build.box(0.07, 0.66, 0.32), leather, Vector3(0, 0.26, 0), Vector3(0, 0, 36))
	Build.part(spine, Build.cyl(0.06, 0.07, 0.12), skin, Vector3(0, 0.54, 0))

	var head := Build.joint(spine, "Head", Vector3(0, 0.57, 0))
	joints["head"] = head
	Build.part(head, Build.ball(0.125, 10, 7), skin, Vector3(0, 0.12, 0), Vector3.ZERO, Vector3(0.95, 1.08, 1.0))
	# Indigo headwrap and face veil leave a band of skin open around the eyes.
	Build.part(head, Build.cyl(0.13, 0.142, 0.12, 10), indigo, Vector3(0, 0.215, 0))
	Build.part(head, Build.ball(0.138, 10, 6), indigo, Vector3(0, 0.27, 0.01), Vector3.ZERO, Vector3(1, 0.7, 1))
	Build.part(head, Build.cyl(0.136, 0.128, 0.085, 10), indigo, Vector3(0, 0.045, -0.006))
	Build.part(head, Build.cyl(0.147, 0.147, 0.03, 10), bronze, Vector3(0, 0.23, 0))
	Build.part(head, Build.box(0.05, 0.05, 0.02), bronze, Vector3(0, 0.235, -0.146), Vector3(0, 0, 45))
	Build.part(head, Build.box(0.042, 0.02, 0.02), Build.mat(Color(0.95, 0.9, 0.82), 0.4), Vector3(0.044, 0.122, -0.112))
	Build.part(head, Build.box(0.042, 0.02, 0.02), Build.mat(Color(0.95, 0.9, 0.82), 0.4), Vector3(-0.044, 0.122, -0.112))
	Build.part(head, Build.box(0.018, 0.02, 0.02), dark, Vector3(0.044, 0.122, -0.122))
	Build.part(head, Build.box(0.018, 0.02, 0.02), dark, Vector3(-0.044, 0.122, -0.122))
	Build.part(head, Build.box(0.11, 0.016, 0.02), dark, Vector3(0, 0.148, -0.118))
	_wrap_tail = Build.joint(head, "WrapTail", Vector3(0, 0.2, 0.13))
	Build.part(_wrap_tail, Build.box(0.09, 0.36, 0.025), indigo, Vector3(0, -0.16, 0.02))

	_cape = Build.joint(spine, "Cape", Vector3(0, 0.48, 0.15))
	Build.part(_cape, Build.box(0.52, 0.86, 0.025), cape_blue, Vector3(0, -0.42, 0))
	Build.part(_cape, Build.box(0.53, 0.08, 0.032), terracotta, Vector3(0, -0.8, 0))
	Build.part(_cape, Build.box(0.08, 0.08, 0.032), bronze, Vector3(0, -0.66, 0), Vector3(0, 0, 45))
	Build.part(_cape, Build.box(0.12, 0.06, 0.06), bronze, Vector3(0, 0.0, -0.02))

	for side: int in [1, -1]:
		var sfx := "_r" if side == 1 else "_l"
		var sh := Build.joint(spine, "Shoulder" + sfx, Vector3(0.28 * side, 0.45, 0))
		joints["sh" + sfx] = sh
		Build.part(sh, Build.ball(0.115, 8, 5), bronze, Vector3(0.02 * side, 0.03, 0), Vector3.ZERO, Vector3(1.15, 0.72, 1.1))
		Build.part(sh, Build.capsule(0.064, 0.34), skin, Vector3(0, -0.15, 0))
		var el := Build.joint(sh, "Elbow" + sfx, Vector3(0, -0.3, 0))
		joints["el" + sfx] = el
		Build.part(el, Build.capsule(0.057, 0.3), skin, Vector3(0, -0.13, 0))
		Build.part(el, Build.cyl(0.07, 0.064, 0.15, 8), bronze, Vector3(0, -0.15, 0))
		var hand := Build.joint(el, "Hand" + sfx, Vector3(0, -0.28, 0))
		joints["hand" + sfx] = hand
		Build.part(hand, Build.ball(0.06, 8, 5), skin, Vector3(0, -0.02, 0))

	for side: int in [1, -1]:
		var sfx := "_r" if side == 1 else "_l"
		var hip := Build.joint(hips, "Hip" + sfx, Vector3(0.11 * side, -0.06, 0))
		joints["hip" + sfx] = hip
		Build.part(hip, Build.capsule(0.088, 0.46), indigo_dark, Vector3(0, -0.21, 0))
		var knee := Build.joint(hip, "Knee" + sfx, Vector3(0, -0.43, 0))
		joints["knee" + sfx] = knee
		Build.part(knee, Build.capsule(0.07, 0.42), indigo_dark, Vector3(0, -0.19, 0))
		Build.part(knee, Build.cyl(0.078, 0.07, 0.2, 8), leather, Vector3(0, -0.3, 0))
		Build.part(knee, Build.box(0.11, 0.07, 0.25), leather, Vector3(0, -0.435, -0.05))

	# Bronze bearded axe. Handle runs along local +Y, blade faces local -Z.
	var axe := Node3D.new()
	axe.name = "Axe"
	(joints["hand_r"] as Node3D).add_child(axe)
	axe.rotation_degrees = Vector3(-90, 0, 0)
	axe.position = Vector3(0, -0.03, 0)
	Build.part(axe, Build.cyl(0.024, 0.029, 1.0, 6), wood, Vector3(0, 0.32, 0))
	Build.part(axe, Build.cyl(0.034, 0.034, 0.2, 6), leather, Vector3(0, 0.0, 0))
	Build.part(axe, Build.ball(0.042, 6, 4), bronze, Vector3(0, -0.19, 0))
	Build.part(axe, Build.box(0.07, 0.17, 0.1), bronze, Vector3(0, 0.74, 0))
	var blade := Build.part(axe, Build.prism(0.42, 0.26, 0.032), bronze, Vector3(0, 0.74, -0.17))
	blade.basis = Basis(Vector3(0, 1, 0), Vector3(0, 0, 1), Vector3(1, 0, 0))
	var edge_m := Build.part(axe, Build.box(0.036, 0.42, 0.03), edge, Vector3(0, 0.74, -0.3))
	edge_m.name = "Edge"
	var spike := Build.part(axe, Build.prism(0.1, 0.12, 0.03), bronze, Vector3(0, 0.74, 0.1))
	spike.basis = Basis(Vector3(0, 1, 0), Vector3(0, 0, 1), Vector3(1, 0, 0))
	Build.part(axe, Build.box(0.034, 0.07, 0.07), terracotta, Vector3(0, 0.74, -0.16), Vector3(45, 0, 0))
	var mark_a := Build.joint(axe, "TrailA", Vector3(0, 0.36, -0.02))
	var mark_b := Build.joint(axe, "TrailB", Vector3(0, 0.76, -0.31))
	_axe_head = Build.joint(axe, "HeadPoint", Vector3(0, 0.74, -0.2))

	weapon_box = Area3D.new()
	weapon_box.name = "WeaponHitbox"
	weapon_box.collision_layer = 0
	weapon_box.collision_mask = 16
	weapon_box.monitorable = false
	weapon_box.monitoring = false
	var ws := CollisionShape3D.new()
	var wbs := BoxShape3D.new()
	wbs.size = Vector3(0.32, 0.6, 0.52)
	ws.shape = wbs
	ws.position = Vector3(0, 0.64, -0.14)
	weapon_box.add_child(ws)
	axe.add_child(weapon_box)

	trail = WeaponTrail.new()
	trail.setup(mark_a, mark_b, Color(1.0, 0.72, 0.32, 0.95))
	add_child(trail)

	# Painted round shield on the left forearm; its face is local -Z.
	_shield = Node3D.new()
	_shield.name = "Shield"
	(joints["el_l"] as Node3D).add_child(_shield)
	var face_mat := ShaderMaterial.new()
	face_mat.shader = preload("res://shaders/shield.gdshader")
	Build.part(_shield, Build.cyl(0.36, 0.36, 0.045, 18), face_mat, Vector3.ZERO, Vector3(90, 0, 0))
	var rim := TorusMesh.new()
	rim.inner_radius = 0.335
	rim.outer_radius = 0.385
	rim.rings = 18
	rim.ring_segments = 6
	Build.part(_shield, rim, bronze, Vector3.ZERO, Vector3(90, 0, 0))
	Build.part(_shield, Build.ball(0.075, 8, 5), bronze, Vector3(0, 0, -0.03), Vector3.ZERO, Vector3(1, 1, 0.55))


func _calibrate_shield() -> void:
	# Orient the shield so it faces forward when the block pose is held.
	PoseAnim.apply_pose(joints, POSES["block"])
	var body_basis := global_transform.basis.orthonormalized()
	var fwd := body_basis * Vector3(0, 0.12, -1).normalized()
	var el: Node3D = joints["el_l"]
	_shield.global_transform = Transform3D(Basis.looking_at(fwd, body_basis.y),
			el.global_transform * Vector3(0, -0.14, 0) + fwd * 0.09)
	PoseAnim.apply_pose(joints, POSES["idle_a"])


# ---------------------------------------------------------------- helpers

func _play(anim_name: String, blend: float = 0.12, speed: float = 1.0, restart: bool = false) -> void:
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


func _turn_toward(dir: Vector3, rate: float, delta: float) -> void:
	if dir.length_squared() < 0.0001:
		return
	var target := atan2(-dir.x, -dir.z)
	rotation.y = lerp_angle(rotation.y, target, 1.0 - exp(-rate * delta))


func _to_enemy() -> Vector3:
	if enemy == null:
		return Vector3.ZERO
	var d := enemy.global_position - global_position
	d.y = 0.0
	return d


func _camera_relative(input: Vector2) -> Vector3:
	if input.length() < 0.05:
		return Vector3.ZERO
	var yaw := camera_rig.yaw if camera_rig else 0.0
	var fwd := Vector3(-sin(yaw), 0, -cos(yaw))
	var right := Vector3(cos(yaw), 0, -sin(yaw))
	return (right * input.x + fwd * -input.y).limit_length(1.0)


func is_invulnerable() -> bool:
	return state == State.DODGE and _state_t >= IFRAME_START and _state_t <= IFRAME_END


func is_alive() -> bool:
	return state != State.DEAD


func current_attack() -> String:
	return _attack if state == State.ATTACK else ""


func attack_time() -> float:
	return _attack_t


func is_blocking() -> bool:
	return _blocking and state == State.FREE


# ---------------------------------------------------------------- input

func _unhandled_input(event: InputEvent) -> void:
	if locked or state == State.DEAD or state == State.CINEMATIC:
		return
	if event.is_action_pressed("attack_light"):
		_buffer("light")
	elif event.is_action_pressed("attack_heavy"):
		_buffer("heavy")
	elif event.is_action_pressed("dodge"):
		_buffer("dodge")


func _buffer(action: String) -> void:
	_queued = action
	_queue_t = BUFFER_TIME


# ---------------------------------------------------------------- simulation

func _physics_process(delta: float) -> void:
	_state_t += delta
	_grace = maxf(_grace - delta, 0.0)
	_queue_t -= delta
	if _queue_t <= 0.0:
		_queued = ""

	var input := Vector2.ZERO
	var want_block := false
	if not locked and state != State.DEAD and state != State.CINEMATIC:
		input = Input.get_vector("move_left", "move_right", "move_forward", "move_back")
		want_block = Input.is_action_pressed("block")
	var wish := _camera_relative(input)

	match state:
		State.FREE:
			_free(delta, wish, want_block)
		State.ATTACK:
			_attacking(delta)
		State.DODGE:
			_dodging(delta)
		State.HIT:
			velocity.x = move_toward(velocity.x, 0.0, 18.0 * delta)
			velocity.z = move_toward(velocity.z, 0.0, 18.0 * delta)
			if _state_t >= 0.36:
				state = State.FREE
		State.DEAD:
			velocity.x = move_toward(velocity.x, 0.0, 10.0 * delta)
			velocity.z = move_toward(velocity.z, 0.0, 10.0 * delta)
		State.CINEMATIC:
			velocity = Vector3.ZERO
			_update_cloth(delta)
			return

	if is_on_floor():
		velocity.y = maxf(velocity.y, -1.0)
	else:
		velocity.y -= GRAVITY * delta
	move_and_slide()
	_update_cloth(delta)


func _free(delta: float, wish: Vector3, want_block: bool) -> void:
	var was_blocking := _blocking
	_blocking = want_block
	if _blocking and not was_blocking:
		_block_t = 0.0
		_play("block", 0.07)
	_block_t += delta
	var speed := BLOCK_SPEED if _blocking else RUN_SPEED
	velocity.x = move_toward(velocity.x, wish.x * speed, ACCEL * delta)
	velocity.z = move_toward(velocity.z, wish.z * speed, ACCEL * delta)
	var to_e := _to_enemy()
	if _blocking and to_e.length() < 12.0:
		_turn_toward(to_e, 18.0, delta)
	elif wish.length() > 0.1:
		_turn_toward(wish, 12.0, delta)

	var hspeed := Vector2(velocity.x, velocity.z).length()
	if _blocking:
		if _anim_name != "block" and _anim_name != "block_hit":
			_play("block", 0.07)
		elif _anim_name == "block_hit" and not anim.is_playing():
			_play("block", 0.05)
	elif hspeed > 0.6:
		_play("run", 0.12)
		anim.speed_scale = clampf(hspeed / RUN_SPEED, 0.6, 1.25)
		_step_t += delta * anim.speed_scale
		if _step_t > 0.31:
			_step_t = 0.0
			Sfx.play("step", -18.0, 1.1)
	else:
		_play("idle", 0.18)
		anim.speed_scale = 1.0

	if _queued == "":
		return
	var action := _queued
	_queued = ""
	if action != "dodge" and _try_finisher():
		return
	match action:
		"dodge":
			_start_dodge(wish)
		"light":
			_start_attack("light1")
		"heavy":
			_start_attack("heavy")


func _try_finisher() -> bool:
	if enemy == null:
		return false
	if enemy.can_be_finished() and _to_enemy().length() <= FINISH_RANGE:
		finisher_requested.emit()
		return true
	return false


func _start_attack(attack_name: String) -> void:
	state = State.ATTACK
	_blocking = false
	_attack = attack_name
	_attack_t = 0.0
	_state_t = 0.0
	_attack_targets.clear()
	anim.speed_scale = 1.0
	var spec: Dictionary = ATTACKS[attack_name]
	var to_e := _to_enemy()
	var dist := to_e.length()
	if dist < 7.0 and dist > 0.01:
		rotation.y = lerp_angle(rotation.y, atan2(-to_e.x, -to_e.z), 0.75)
	var lunge: float = spec["lunge"]
	if dist < 2.3:
		lunge *= 0.25
	var f := facing()
	velocity.x = f.x * lunge
	velocity.z = f.z * lunge
	_play(attack_name, 0.05, 1.0, true)


func _attacking(delta: float) -> void:
	var spec: Dictionary = ATTACKS[_attack]
	var windup: float = spec["windup"]
	var active_end: float = windup + float(spec["active"])
	var total: float = active_end + float(spec["recover"])
	var prev := _attack_t
	_attack_t += delta

	var to_e := _to_enemy()
	if _attack_t < windup and to_e.length() < 7.0:
		_turn_toward(to_e, 16.0, delta)
	if to_e.length() < 1.75:
		velocity.x = 0.0
		velocity.z = 0.0
	velocity.x = move_toward(velocity.x, 0.0, 12.0 * delta)
	velocity.z = move_toward(velocity.z, 0.0, 12.0 * delta)

	if prev < windup and _attack_t >= windup:
		weapon_box.monitoring = true
		trail.emitting = true
		Sfx.play("whoosh_heavy" if _attack == "heavy" else "whoosh", -4.0, 1.0 if _attack != "light3" else 0.85)
	if _attack_t >= windup and _attack_t < active_end + 0.02:
		_check_weapon_hits(spec)
	if prev < active_end + 0.02 and _attack_t >= active_end + 0.02:
		weapon_box.monitoring = false
		trail.emitting = false
		if _attack == "heavy" or _attack == "light3":
			_ground_impact(_attack == "heavy")

	var next: String = spec["next"]
	if _attack_t >= active_end:
		if (_queued == "light" or _queued == "heavy") and _try_finisher():
			_queued = ""
			return
		if _queued == "light" and next != "":
			_queued = ""
			_start_attack(next)
			return
		if _queued == "heavy" and _attack != "heavy" and _attack_t >= active_end + 0.06:
			_queued = ""
			_start_attack("heavy")
			return
		if _queued == "dodge":
			_queued = ""
			_end_attack()
			_start_dodge(Vector3.ZERO)
			return
	if _attack_t >= total:
		_end_attack()
		state = State.FREE
		_play("idle", 0.2)


func _end_attack() -> void:
	weapon_box.monitoring = false
	trail.emitting = false
	_attack = ""


func _check_weapon_hits(spec: Dictionary) -> void:
	for area: Area3D in weapon_box.get_overlapping_areas():
		var target = area.get_parent()
		if target == null or _attack_targets.has(target) or not target.has_method("receive_hit"):
			continue
		_attack_targets[target] = true
		var info := {
			"damage": float(spec["damage"]),
			"poise": float(spec["poise"]),
			"kind": String(spec["kind"]),
			"from": global_position,
			"point": _axe_head.global_position,
			"attacker": self,
		}
		var result: String = target.receive_hit(info)
		landed_hit.emit(result, float(spec["damage"]))


func _ground_impact(heavy: bool) -> void:
	var p := _axe_head.global_position
	p.y = 0.05
	if FX.inst:
		FX.inst.shockwave(p, Color(1.0, 0.65, 0.25), 2.6 if heavy else 1.6, 0.4)
		FX.inst.dust(p, 18 if heavy else 8, 3.5)
		FX.inst.sparks(p + Vector3.UP * 0.1, Color(1.0, 0.7, 0.3), 18 if heavy else 8)
		if heavy:
			FX.inst.shake(0.45)
			FX.inst.impact_light(p + Vector3.UP * 0.8, Color(1.0, 0.6, 0.3), 2.0, 0.2)
	Sfx.play("boom" if heavy else "step", -8.0 if heavy else -6.0, 1.2)


func _start_dodge(wish: Vector3) -> void:
	state = State.DODGE
	_state_t = 0.0
	_blocking = false
	anim.speed_scale = 1.0
	var dir := wish if wish.length() > 0.2 else -facing()
	_dodge_dir = dir.normalized()
	rotation.y = atan2(-_dodge_dir.x, -_dodge_dir.z)
	_play("roll", 0.04, 1.0, true)
	Sfx.play("whoosh", -6.0, 0.7)
	if FX.inst:
		FX.inst.dust(global_position, 10, 2.0)


func _dodging(delta: float) -> void:
	var k := clampf(_state_t / DODGE_TIME, 0.0, 1.0)
	var speed := lerpf(DODGE_SPEED, 1.5, k * k)
	velocity.x = _dodge_dir.x * speed
	velocity.z = _dodge_dir.z * speed
	if _state_t >= DODGE_TIME:
		state = State.FREE
		_play("idle", 0.0)
		if FX.inst:
			FX.inst.dust(global_position, 6, 1.5)


func _update_cloth(delta: float) -> void:
	var hspeed := Vector2(velocity.x, velocity.z).length()
	_cloth_t += delta
	var t := _cloth_t
	var target := -deg_to_rad(6.0 + hspeed * 7.0) + sin(t * 7.0) * deg_to_rad(2.0 + hspeed)
	_cape.rotation.x = lerpf(_cape.rotation.x, target, 1.0 - exp(-8.0 * delta))
	_wrap_tail.rotation.x = lerpf(_wrap_tail.rotation.x, target * 1.2 - 0.2, 1.0 - exp(-8.0 * delta))


# ---------------------------------------------------------------- damage

func receive_hit(info: Dictionary) -> String:
	if state == State.DEAD or state == State.CINEMATIC:
		return "ignored"
	var from: Vector3 = info["from"]
	var to_att := from - global_position
	to_att.y = 0.0
	to_att = to_att.normalized()
	if is_invulnerable():
		defended.emit("dodge")
		return "dodged"
	if _grace > 0.0:
		return "ignored"
	var shield_point := _shield.global_position
	if is_blocking() and facing().dot(to_att) > BLOCK_ARC_DOT and bool(info.get("blockable", true)):
		if bool(info.get("parryable", true)) and _block_t <= PARRY_WINDOW:
			if FX.inst:
				FX.inst.sparks(shield_point, Color(1.0, 0.85, 0.4), 44)
				FX.inst.shockwave(global_position, Color(1.0, 0.8, 0.35), 2.0, 0.3)
				FX.inst.impact_light(shield_point, Color(1.0, 0.8, 0.4), 6.0, 0.25)
				FX.inst.hit_stop(0.13)
				FX.inst.shake(0.4)
				FX.inst.flash(Color(1.0, 0.85, 0.5, 0.35), 0.15)
			Sfx.play("parry", -1.0)
			_play("block_hit", 0.03, 1.0, true)
			defended.emit("parry")
			return "parried"
		var chip: float = float(info["damage"]) * 0.15
		_apply_damage(chip)
		velocity = -to_att * 3.5
		if FX.inst:
			FX.inst.sparks(shield_point, Color(1.0, 0.75, 0.35), 26)
			FX.inst.hit_stop(0.06)
			FX.inst.shake(0.25)
		Sfx.play("clang", -3.0)
		_play("block_hit", 0.03, 1.0, true)
		defended.emit("block")
		return "blocked"

	_apply_damage(float(info["damage"]))
	var point: Vector3 = info.get("point", global_position + Vector3.UP)
	if FX.inst:
		FX.inst.burst(point, Color(0.85, 0.12, 0.08), 22, 5.0, 0.5, 0.1, -12.0, false, to_att * -1.0 + Vector3.UP * 0.5, 60.0)
		FX.inst.sparks(point, Color(1.0, 0.5, 0.3), 12)
		FX.inst.hit_stop(0.08)
		FX.inst.shake(0.55)
		FX.inst.flash(Color(0.9, 0.1, 0.05, 0.16), 0.2)
		FX.inst.damage_number(point + Vector3.UP * 0.3, float(info["damage"]), Color(1.0, 0.35, 0.3))
	_flash()
	Sfx.play("hit_heavy", -2.0, 0.9)
	_end_attack()
	_blocking = false
	if hp <= 0.0:
		_die()
		return "hit"
	state = State.HIT
	_state_t = 0.0
	_grace = 0.45
	var kb: float = info.get("knockback", 5.0)
	velocity = -to_att * kb
	velocity.y = 0.0
	_play("hit", 0.03, 1.0, true)
	return "hit"


func _apply_damage(amount: float) -> void:
	hp = maxf(hp - amount, 0.0)
	health_changed.emit(hp, MAX_HP)


func _flash() -> void:
	_flash_mat.albedo_color.a = 0.55
	var tw := create_tween()
	tw.tween_property(_flash_mat, "albedo_color:a", 0.0, 0.2)


func _die() -> void:
	state = State.DEAD
	_end_attack()
	hurtbox.set_deferred("monitorable", false)
	_play("death", 0.08, 1.0, true)
	died.emit()


func kill_for_test() -> void:
	_apply_damage(hp)
	_die()


# ---------------------------------------------------------------- cinematic hooks

func begin_finisher() -> void:
	state = State.CINEMATIC
	_end_attack()
	_blocking = false
	anim.speed_scale = 1.0
	_play("finisher", 0.08, 1.0, true)


func finisher_swing_fx(on: bool) -> void:
	trail.emitting = on


func play_victory() -> void:
	state = State.CINEMATIC
	_play("victory", 0.25, 1.0, true)


func axe_head_position() -> Vector3:
	return _axe_head.global_position

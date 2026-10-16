class_name CamPath
extends RefCounted
## Reusable cinematic camera move: keyframes of position, look-at target and
## vertical FOV, sampled with Catmull-Rom splines and an ease curve.

var keys: Array = []
var ease_in_out := true


## keys: [[u, pos: Vector3, look: Vector3, fov: float], ...] with u in 0..1.
func _init(k: Array, smooth: bool = true) -> void:
	keys = k
	ease_in_out = smooth


static func _cr(p0: Vector3, p1: Vector3, p2: Vector3, p3: Vector3, t: float) -> Vector3:
	var t2 := t * t
	var t3 := t2 * t
	return 0.5 * ((2.0 * p1) + (-p0 + p2) * t + (2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3) * t2 + (-p0 + 3.0 * p1 - 3.0 * p2 + p3) * t3)


## Returns [pos, look, fov] at progress u (0..1).
func sample(u: float) -> Array:
	u = clampf(u, 0.0, 1.0)
	if ease_in_out:
		u = u * u * (3.0 - 2.0 * u)
	var n := keys.size()
	if n == 1:
		return [keys[0][1], keys[0][2], keys[0][3]]
	var i := 0
	while i < n - 2 and u > float(keys[i + 1][0]):
		i += 1
	var u0: float = keys[i][0]
	var u1: float = keys[i + 1][0]
	var t := clampf((u - u0) / maxf(u1 - u0, 0.0001), 0.0, 1.0)
	var a: Array = keys[maxi(i - 1, 0)]
	var b: Array = keys[i]
	var c: Array = keys[i + 1]
	var d: Array = keys[mini(i + 2, n - 1)]
	var pos := _cr(a[1], b[1], c[1], d[1], t)
	var look := _cr(a[2], b[2], c[2], d[2], t)
	var fov := lerpf(float(b[3]), float(c[3]), t)
	return [pos, look, fov]


func apply(cam: Camera3D, u: float, shake: Vector3 = Vector3.ZERO) -> void:
	var s := sample(u)
	cam.global_position = s[0] + shake
	var look: Vector3 = s[1]
	if not cam.global_position.is_equal_approx(look):
		cam.look_at(look + shake * 0.5, Vector3.UP)
	cam.fov = s[2]

class_name PoseAnim
extends RefCounted
## Turns named key poses (joint -> Euler degrees) into Godot Animation resources,
## so every character move is played through a native AnimationPlayer.


## joints: name -> Node3D. poses: pose name -> {joint: Vector3 degrees, "root": Vector3 offset}.
## anims: anim name -> {"len": float, "loop": bool, "keys": [[time, pose_name], ...]}.
static func build_library(base: Node, joints: Dictionary, root_joint: String, root_rest: Vector3,
		poses: Dictionary, anims: Dictionary) -> AnimationLibrary:
	var lib := AnimationLibrary.new()
	for anim_name: String in anims:
		var spec: Dictionary = anims[anim_name]
		var a := Animation.new()
		a.length = float(spec["len"])
		a.loop_mode = Animation.LOOP_LINEAR if bool(spec.get("loop", false)) else Animation.LOOP_NONE
		var keys: Array = spec["keys"]
		for jn: String in joints:
			var node: Node3D = joints[jn]
			var t := a.add_track(Animation.TYPE_VALUE)
			a.track_set_path(t, NodePath(str(base.get_path_to(node)) + ":rotation"))
			a.track_set_interpolation_type(t, Animation.INTERPOLATION_CUBIC)
			for k: Array in keys:
				var pose: Dictionary = poses[k[1]]
				var deg: Vector3 = pose.get(jn, Vector3.ZERO)
				a.track_insert_key(t, float(k[0]), deg * (PI / 180.0))
		var root_node: Node3D = joints[root_joint]
		var tp := a.add_track(Animation.TYPE_VALUE)
		a.track_set_path(tp, NodePath(str(base.get_path_to(root_node)) + ":position"))
		a.track_set_interpolation_type(tp, Animation.INTERPOLATION_CUBIC)
		for k: Array in keys:
			var pose: Dictionary = poses[k[1]]
			var off: Vector3 = pose.get("root", Vector3.ZERO)
			a.track_insert_key(tp, float(k[0]), root_rest + off)
		lib.add_animation(anim_name, a)
	return lib


## Applies a pose immediately (used to calibrate attachments such as the shield).
static func apply_pose(joints: Dictionary, pose: Dictionary) -> void:
	for jn: String in joints:
		var node: Node3D = joints[jn]
		var deg: Vector3 = pose.get(jn, Vector3.ZERO)
		node.rotation = deg * (PI / 180.0)


## Mirrors a pose left/right (swaps _l/_r joints and flips yaw/roll).
static func mirror(pose: Dictionary) -> Dictionary:
	var out := {}
	for k: String in pose:
		var v: Vector3 = pose[k]
		var nk := k
		if k.ends_with("_r"):
			nk = k.trim_suffix("_r") + "_l"
		elif k.ends_with("_l"):
			nk = k.trim_suffix("_l") + "_r"
		if k == "root":
			out[nk] = Vector3(-v.x, v.y, v.z)
		else:
			out[nk] = Vector3(v.x, -v.y, -v.z)
	return out

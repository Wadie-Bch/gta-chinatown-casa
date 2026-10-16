class_name TouchControls
extends Control
## Large on-screen controls for touchscreens: a virtual stick on the left and
## LIGHT / HEAVY / DODGE / BLOCK buttons on the right. They drive the same
## input actions as the keyboard, so gameplay code does not know the difference.

var portrait := false
var font: Font

var _stick_center := Vector2.ZERO
var _stick_radius := 110.0
var _stick_touch := -1
var _stick_vec := Vector2.ZERO
var _buttons: Array[Dictionary] = []


func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	set_anchors_preset(Control.PRESET_FULL_RECT)
	_buttons = [
		{"label": "LIGHT", "action": "attack_light", "hold": false, "color": Color(1.0, 0.75, 0.35)},
		{"label": "HEAVY", "action": "attack_heavy", "hold": false, "color": Color(1.0, 0.45, 0.25)},
		{"label": "DODGE", "action": "dodge", "hold": false, "color": Color(0.5, 0.85, 1.0)},
		{"label": "BLOCK", "action": "block", "hold": true, "color": Color(0.75, 0.75, 1.0)},
	]
	for b in _buttons:
		b["touch"] = -1
		b["center"] = Vector2.ZERO
		b["radius"] = 60.0
	get_viewport().size_changed.connect(_layout)
	_layout()


func set_portrait(on: bool) -> void:
	portrait = on
	_layout()


func _layout() -> void:
	var vp := get_viewport().get_visible_rect().size
	var scale_k := 1.0 if portrait else 0.85
	_stick_radius = 105.0 * scale_k
	var bottom := vp.y - (185.0 if portrait else 150.0)
	_stick_center = Vector2(60.0 + _stick_radius + 20.0, bottom)
	var r_big := 72.0 * scale_k
	var r_small := 54.0 * scale_k
	var rx := vp.x - 60.0 - r_big
	_buttons[0]["center"] = Vector2(rx - r_big * 0.2, bottom + 10.0)
	_buttons[0]["radius"] = r_big
	_buttons[1]["center"] = Vector2(rx - r_big * 2.2, bottom - r_big * 0.9)
	_buttons[1]["radius"] = r_small
	_buttons[2]["center"] = Vector2(rx - r_big * 2.5, bottom + r_big * 0.9)
	_buttons[2]["radius"] = r_small
	_buttons[3]["center"] = Vector2(rx - r_big * 0.4, bottom - r_big * 2.0)
	_buttons[3]["radius"] = r_small
	queue_redraw()


func _input(event: InputEvent) -> void:
	if not visible:
		return
	if event is InputEventScreenTouch:
		var st := event as InputEventScreenTouch
		if st.pressed:
			if st.position.distance_to(_stick_center) < _stick_radius * 1.6 and _stick_touch == -1:
				_stick_touch = st.index
				_update_stick(st.position)
				get_viewport().set_input_as_handled()
				return
			for b in _buttons:
				if st.position.distance_to(b["center"]) < float(b["radius"]) * 1.25:
					b["touch"] = st.index
					_send(String(b["action"]), true)
					if not bool(b["hold"]):
						_send(String(b["action"]), false)
					get_viewport().set_input_as_handled()
					queue_redraw()
					return
		else:
			if st.index == _stick_touch:
				_stick_touch = -1
				_update_stick(_stick_center)
			for b in _buttons:
				if int(b["touch"]) == st.index:
					b["touch"] = -1
					if bool(b["hold"]):
						_send(String(b["action"]), false)
			queue_redraw()
	elif event is InputEventScreenDrag:
		var sd := event as InputEventScreenDrag
		if sd.index == _stick_touch:
			_update_stick(sd.position)
			get_viewport().set_input_as_handled()


func _send(action: String, pressed: bool) -> void:
	var ev := InputEventAction.new()
	ev.action = action
	ev.pressed = pressed
	ev.strength = 1.0 if pressed else 0.0
	Input.parse_input_event(ev)


func _update_stick(pos: Vector2) -> void:
	var v := (pos - _stick_center) / _stick_radius
	_stick_vec = v.limit_length(1.0)
	_set_axis("move_right", maxf(_stick_vec.x, 0.0))
	_set_axis("move_left", maxf(-_stick_vec.x, 0.0))
	_set_axis("move_back", maxf(_stick_vec.y, 0.0))
	_set_axis("move_forward", maxf(-_stick_vec.y, 0.0))
	queue_redraw()


func _set_axis(action: String, strength: float) -> void:
	if strength > 0.15:
		Input.action_press(action, strength)
	else:
		Input.action_release(action)


func _draw() -> void:
	draw_circle(_stick_center, _stick_radius, Color(0.05, 0.05, 0.1, 0.35))
	draw_arc(_stick_center, _stick_radius, 0.0, TAU, 48, Color(0.95, 0.75, 0.4, 0.7), 3.0, true)
	draw_circle(_stick_center + _stick_vec * _stick_radius * 0.6, _stick_radius * 0.38, Color(0.95, 0.75, 0.4, 0.55))
	for b in _buttons:
		var c: Vector2 = b["center"]
		var r: float = b["radius"]
		var col: Color = b["color"]
		var pressed := int(b["touch"]) != -1
		draw_circle(c, r, Color(col.r * 0.25, col.g * 0.25, col.b * 0.25, 0.55 if not pressed else 0.8))
		draw_arc(c, r, 0.0, TAU, 40, Color(col, 0.9), 3.0, true)
		if font:
			var fs := int(r * 0.36)
			var label: String = b["label"]
			var w := font.get_string_size(label, HORIZONTAL_ALIGNMENT_LEFT, -1, fs).x
			draw_string(font, c + Vector2(-w * 0.5, fs * 0.35), label, HORIZONTAL_ALIGNMENT_LEFT, -1, fs, Color(1, 1, 1, 0.95))

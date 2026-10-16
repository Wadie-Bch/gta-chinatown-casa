class_name UiBar
extends Control
## Health / poise bar with a lagging damage trail and bronze frame.

var max_value := 100.0
var value := 100.0
var trail := 100.0
var fill_a := Color(0.85, 0.3, 0.15)
var fill_b := Color(1.0, 0.65, 0.25)
var trail_color := Color(1.0, 0.93, 0.75)
var back_color := Color(0.04, 0.03, 0.05, 0.72)
var frame_color := Color(0.86, 0.62, 0.3)
var ticks := 10
var low_pulse := false

var _delay := 0.0
var _t := 0.0


func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE


func set_values(v: float, m: float) -> void:
	if v < value:
		_delay = 0.4
	max_value = maxf(m, 0.001)
	value = clampf(v, 0.0, max_value)
	if trail < value:
		trail = value
	queue_redraw()


func _process(delta: float) -> void:
	var rdt := FX.real_delta(delta)
	_t += rdt
	if _delay > 0.0:
		_delay -= rdt
	elif trail > value:
		trail = maxf(trail - max_value * 0.7 * rdt, value)
	queue_redraw()


func _draw() -> void:
	var w := size.x
	var h := size.y
	var slant := h * 0.6
	var outer := PackedVector2Array([Vector2(-slant - 3, h + 3), Vector2(-3, -3), Vector2(w + slant + 3, -3), Vector2(w + 3, h + 3)])
	draw_colored_polygon(outer, Color(0.1, 0.06, 0.03, 0.9))
	var inner := PackedVector2Array([Vector2(-slant, h), Vector2(0, 0), Vector2(w + slant, 0), Vector2(w, h)])
	draw_colored_polygon(inner, back_color)
	var tr := w * trail / max_value
	if tr > 0.5:
		draw_rect(Rect2(0, 0, tr, h), trail_color)
	var f := w * value / max_value
	if f > 0.5:
		var mid := fill_a.lerp(fill_b, f / w)
		var pulse := 1.0
		if low_pulse and value / max_value < 0.3:
			pulse = 0.75 + 0.25 * sin(_t * 9.0)
		draw_polygon(PackedVector2Array([Vector2(0, 0), Vector2(f, 0), Vector2(f, h), Vector2(0, h)]),
				PackedColorArray([fill_a * pulse, mid * pulse, mid * pulse, fill_a * pulse]))
		draw_rect(Rect2(0, 0, f, h * 0.32), Color(1, 1, 1, 0.16))
	for i in range(1, ticks):
		var x := w * float(i) / float(ticks)
		draw_line(Vector2(x, h * 0.55), Vector2(x, h), Color(0, 0, 0, 0.35), 1.0)
	draw_polyline(PackedVector2Array([Vector2(-slant, h), Vector2(0, 0), Vector2(w + slant, 0), Vector2(w, h), Vector2(-slant, h)]), frame_color, 2.0, true)
	for x: float in [-slant * 0.5 - 10.0, w + slant * 0.5 + 10.0]:
		var c := Vector2(x, h * 0.5)
		var r := h * 0.55
		draw_colored_polygon(PackedVector2Array([c + Vector2(0, -r), c + Vector2(r * 0.7, 0), c + Vector2(0, r), c + Vector2(-r * 0.7, 0)]), frame_color)

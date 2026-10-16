class_name Hud
extends CanvasLayer
## Combat HUD with separate landscape and portrait (9:16) layouts. Everything
## essential stays inside safe margins for phone viewing.

var portrait := false
var show_hints := true
## On-screen controls occupy the bottom of a portrait screen, so the player's
## bar moves up under the boss bar.
var touch_mode := false

var title_font: FontVariation
var title_font_black: FontVariation
var ui_font: Font

var _root: Control
var _boss_name: Label
var _boss_bar: UiBar
var _poise_bar: UiBar
var _player_name: Label
var _player_bar: UiBar
var _center: Label
var _combo: Label
var _prompt: Label
var _title: Label
var _subtitle: Label
var _ornament: Control
var _end_title: Label
var _end_sub: Label
var _end_hint: Label
var _hint: Label
var _flash: ColorRect
var _hurt: TextureRect
var _vignette: TextureRect
var _bar_top: ColorRect
var _bar_bottom: ColorRect
var _combo_count := 0
var _combo_timer := 0.0
var _prompt_t := 0.0
var _letterbox := 0.0
var _letterbox_target := 0.0
var _low_hp := false
var _t := 0.0


func _ready() -> void:
	layer = 5
	process_mode = Node.PROCESS_MODE_ALWAYS
	var ts := TextServerManager.get_primary_interface()
	var cinzel: FontFile = load("res://assets/fonts/Cinzel-Variable.ttf")
	title_font = FontVariation.new()
	title_font.base_font = cinzel
	title_font.variation_opentype = {ts.name_to_tag("wght"): 700}
	title_font.spacing_glyph = 2
	title_font_black = FontVariation.new()
	title_font_black.base_font = cinzel
	title_font_black.variation_opentype = {ts.name_to_tag("wght"): 900}
	title_font_black.spacing_glyph = 4
	ui_font = load("res://assets/fonts/Inter-SemiBold.otf")
	_build()
	get_viewport().size_changed.connect(_layout)
	_layout()


func _label(font: Font, size: int, color: Color, outline: int = 8, align: HorizontalAlignment = HORIZONTAL_ALIGNMENT_CENTER) -> Label:
	var l := Label.new()
	var s := LabelSettings.new()
	s.font = font
	s.font_size = size
	s.font_color = color
	s.outline_size = outline
	s.outline_color = Color(0.05, 0.03, 0.02, 0.92)
	s.shadow_size = 6
	s.shadow_color = Color(0, 0, 0, 0.45)
	s.shadow_offset = Vector2(0, 3)
	l.label_settings = s
	l.horizontal_alignment = align
	l.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	l.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_root.add_child(l)
	return l


func _build() -> void:
	_root = Control.new()
	_root.set_anchors_preset(Control.PRESET_FULL_RECT)
	_root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_root)

	_vignette = TextureRect.new()
	_vignette.texture = _radial(Color(0, 0, 0, 0), Color(0.06, 0.02, 0.02, 0.62), 0.55)
	_vignette.stretch_mode = TextureRect.STRETCH_SCALE
	_vignette.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_root.add_child(_vignette)
	_hurt = TextureRect.new()
	_hurt.texture = _radial(Color(0.6, 0, 0, 0), Color(0.75, 0.02, 0.0, 0.85), 0.35)
	_hurt.stretch_mode = TextureRect.STRETCH_SCALE
	_hurt.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_hurt.modulate.a = 0.0
	_root.add_child(_hurt)

	_bar_top = ColorRect.new()
	_bar_top.color = Color(0, 0, 0, 0.94)
	_bar_top.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_root.add_child(_bar_top)
	_bar_bottom = ColorRect.new()
	_bar_bottom.color = Color(0, 0, 0, 0.94)
	_bar_bottom.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_root.add_child(_bar_bottom)

	_boss_name = _label(title_font, 30, Color(0.82, 0.95, 1.0), 9)
	_boss_name.text = "THE STAR-EATER"
	_boss_bar = UiBar.new()
	_boss_bar.fill_a = Color(0.45, 0.2, 0.85)
	_boss_bar.fill_b = Color(0.25, 0.95, 0.9)
	_boss_bar.trail_color = Color(1.0, 0.95, 0.85)
	_root.add_child(_boss_bar)
	_poise_bar = UiBar.new()
	_poise_bar.fill_a = Color(0.95, 0.75, 0.3)
	_poise_bar.fill_b = Color(1.0, 0.92, 0.6)
	_poise_bar.trail_color = Color(1.0, 1.0, 1.0, 0.4)
	_poise_bar.ticks = 4
	_poise_bar.value = 0.0
	_poise_bar.trail = 0.0
	_root.add_child(_poise_bar)

	_player_name = _label(title_font, 26, Color(1.0, 0.86, 0.6), 8, HORIZONTAL_ALIGNMENT_LEFT)
	_player_name.text = "IDIR  ·  WARRIOR OF THE ATLAS"
	_player_bar = UiBar.new()
	_player_bar.fill_a = Color(0.7, 0.16, 0.08)
	_player_bar.fill_b = Color(0.98, 0.55, 0.2)
	_player_bar.low_pulse = true
	_root.add_child(_player_bar)

	_center = _label(title_font_black, 64, Color(1.0, 0.9, 0.6), 14)
	_center.modulate.a = 0.0
	_combo = _label(title_font_black, 40, Color(1.0, 0.82, 0.45), 10, HORIZONTAL_ALIGNMENT_RIGHT)
	_combo.modulate.a = 0.0
	_prompt = _label(title_font_black, 40, Color(1.0, 0.95, 0.75), 12)
	_prompt.visible = false

	_title = _label(title_font_black, 70, Color(1.0, 0.86, 0.52), 14)
	_title.text = "AMAZIGH SAGA"
	_subtitle = _label(title_font, 30, Color(0.85, 0.92, 1.0), 9)
	_subtitle.text = "WAR AGAINST THE STARS"
	_ornament = Control.new()
	_ornament.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_ornament.draw.connect(_draw_ornament)
	_root.add_child(_ornament)
	for c: CanvasItem in [_title, _subtitle, _ornament]:
		c.modulate.a = 0.0

	_end_title = _label(title_font_black, 96, Color(1.0, 0.84, 0.45), 16)
	_end_sub = _label(title_font, 30, Color(0.95, 0.92, 0.85), 9)
	_end_hint = _label(ui_font, 26, Color(1, 1, 1, 0.9), 7)
	for c: CanvasItem in [_end_title, _end_sub, _end_hint]:
		c.visible = false

	_hint = _label(ui_font, 17, Color(1, 0.95, 0.88, 0.85), 5, HORIZONTAL_ALIGNMENT_RIGHT)
	_hint.text = "WASD move   ·   J / LMB light   ·   K / RMB heavy   ·   SPACE dodge   ·   SHIFT block   ·   R restart"

	_flash = ColorRect.new()
	_flash.color = Color(1, 1, 1, 0)
	_flash.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_root.add_child(_flash)


func _radial(inner: Color, outer: Color, start: float) -> GradientTexture2D:
	var g := Gradient.new()
	g.set_color(0, inner)
	g.set_color(1, outer)
	g.add_point(start, inner)
	var t := GradientTexture2D.new()
	t.gradient = g
	t.fill = GradientTexture2D.FILL_RADIAL
	t.fill_from = Vector2(0.5, 0.5)
	t.fill_to = Vector2(1.05, 0.5)
	t.width = 256
	t.height = 256
	return t


func _draw_ornament() -> void:
	# Zigzag band with lozenges, a fictional Amazigh-inspired flourish.
	var w := _ornament.size.x
	var h := _ornament.size.y
	var gold := Color(0.95, 0.72, 0.35)
	var pts := PackedVector2Array()
	var n := 18
	for i in n + 1:
		pts.append(Vector2(w * float(i) / n, h * (0.2 if i % 2 == 0 else 0.8)))
	_ornament.draw_polyline(pts, gold, 3.0, true)
	var c := Vector2(w * 0.5, h * 0.5)
	var r := h * 0.9
	_ornament.draw_colored_polygon(PackedVector2Array([c + Vector2(0, -r), c + Vector2(r, 0), c + Vector2(0, r), c + Vector2(-r, 0)]), Color(0.08, 0.13, 0.4))
	_ornament.draw_polyline(PackedVector2Array([c + Vector2(0, -r), c + Vector2(r, 0), c + Vector2(0, r), c + Vector2(-r, 0), c + Vector2(0, -r)]), gold, 3.0, true)
	var r2 := r * 0.4
	_ornament.draw_colored_polygon(PackedVector2Array([c + Vector2(0, -r2), c + Vector2(r2, 0), c + Vector2(0, r2), c + Vector2(-r2, 0)]), Color(0.75, 0.3, 0.15))


func set_portrait(on: bool) -> void:
	portrait = on
	_layout()


func _place(c: Control, pos: Vector2, sz: Vector2) -> void:
	c.position = pos
	c.size = sz
	c.pivot_offset = sz * 0.5


func _layout() -> void:
	if _root == null:
		return
	var vp := get_viewport().get_visible_rect().size
	_place(_vignette, Vector2.ZERO, vp)
	_place(_hurt, Vector2.ZERO, vp)
	_place(_flash, Vector2.ZERO, vp)
	var lb := (110.0 if portrait else 72.0) * _letterbox
	_place(_bar_top, Vector2(0, -2), Vector2(vp.x, lb + 2))
	_place(_bar_bottom, Vector2(0, vp.y - lb), Vector2(vp.x, lb + 2))
	if portrait:
		# Safe zone: ~150 px top, ~250 px bottom, ~60 px sides on a 720x1280 canvas.
		var bar_w := vp.x - 180.0
		var x0 := (vp.x - bar_w) * 0.5
		_place(_boss_name, Vector2(0, 150), Vector2(vp.x, 40))
		_place(_boss_bar, Vector2(x0, 196), Vector2(bar_w, 22))
		_place(_poise_bar, Vector2(x0 + bar_w * 0.2, 228), Vector2(bar_w * 0.6, 8))
		if touch_mode:
			_place(_player_name, Vector2(x0 - 6, 256), Vector2(bar_w, 32))
			_place(_player_bar, Vector2(x0, 294), Vector2(bar_w * 0.55, 18))
			_place(_combo, Vector2(0, 282), Vector2(vp.x - x0, 56))
		else:
			_place(_player_name, Vector2(x0 - 6, vp.y - 312), Vector2(bar_w, 36))
			_place(_player_bar, Vector2(x0, vp.y - 270), Vector2(bar_w * 0.78, 22))
			_place(_combo, Vector2(0, 262), Vector2(vp.x - x0, 56))
		_place(_center, Vector2(0, vp.y * 0.36), Vector2(vp.x, 90))
		_place(_prompt, Vector2(0, vp.y * (0.56 if touch_mode else 0.62)), Vector2(vp.x, 60))
		_place(_title, Vector2(0, vp.y * 0.30), Vector2(vp.x, 90))
		_place(_ornament, Vector2(vp.x * 0.5 - 220, vp.y * 0.30 + 98), Vector2(440, 26))
		_place(_subtitle, Vector2(0, vp.y * 0.30 + 136), Vector2(vp.x, 44))
		_place(_end_title, Vector2(0, vp.y * 0.38), Vector2(vp.x, 120))
		_place(_end_sub, Vector2(0, vp.y * 0.38 + 120), Vector2(vp.x, 44))
		_place(_end_hint, Vector2(0, vp.y * 0.38 + 172), Vector2(vp.x, 40))
		_title.label_settings.font_size = 64
		_end_title.label_settings.font_size = 86
		_hint.visible = false
	else:
		var bar_w := minf(680.0, vp.x * 0.5)
		_place(_boss_name, Vector2(0, 22), Vector2(vp.x, 36))
		_place(_boss_bar, Vector2((vp.x - bar_w) * 0.5, 62), Vector2(bar_w, 20))
		_place(_poise_bar, Vector2((vp.x - bar_w * 0.6) * 0.5, 90), Vector2(bar_w * 0.6, 7))
		_place(_player_name, Vector2(56, vp.y - 104), Vector2(500, 32))
		_place(_player_bar, Vector2(60, vp.y - 66), Vector2(380, 20))
		_place(_center, Vector2(0, vp.y * 0.3), Vector2(vp.x, 90))
		_place(_combo, Vector2(0, 110), Vector2(vp.x - 70, 56))
		_place(_prompt, Vector2(0, vp.y * 0.66), Vector2(vp.x, 60))
		_place(_title, Vector2(0, vp.y * 0.26), Vector2(vp.x, 100))
		_place(_ornament, Vector2(vp.x * 0.5 - 240, vp.y * 0.26 + 104), Vector2(480, 26))
		_place(_subtitle, Vector2(0, vp.y * 0.26 + 140), Vector2(vp.x, 44))
		_place(_end_title, Vector2(0, vp.y * 0.32), Vector2(vp.x, 120))
		_place(_end_sub, Vector2(0, vp.y * 0.32 + 120), Vector2(vp.x, 44))
		_place(_end_hint, Vector2(0, vp.y * 0.32 + 170), Vector2(vp.x, 40))
		_place(_hint, Vector2(0, vp.y - 40), Vector2(vp.x - 40, 28))
		_title.label_settings.font_size = 78
		_end_title.label_settings.font_size = 100
		_hint.visible = show_hints
	_ornament.queue_redraw()


func _tween() -> Tween:
	var tw := create_tween()
	tw.set_ignore_time_scale(true)
	return tw


func _process(delta: float) -> void:
	var rdt := FX.real_delta(delta)
	_t += rdt
	if _combo_timer > 0.0:
		_combo_timer -= rdt
		if _combo_timer <= 0.0:
			_combo_count = 0
			_tween().tween_property(_combo, "modulate:a", 0.0, 0.3)
	if _prompt.visible:
		_prompt_t += rdt
		var s := 1.0 + 0.06 * sin(_prompt_t * 8.0)
		_prompt.scale = Vector2(s, s)
		_prompt.modulate.a = 0.75 + 0.25 * sin(_prompt_t * 8.0)
	if not is_equal_approx(_letterbox, _letterbox_target):
		_letterbox = move_toward(_letterbox, _letterbox_target, rdt * 3.0)
		_layout()
	if _low_hp:
		_hurt.modulate.a = maxf(_hurt.modulate.a, 0.25 + 0.15 * sin(_t * 6.0))


# ---------------------------------------------------------------- API

func set_boss_health(v: float, m: float) -> void:
	_boss_bar.set_values(v, m)


func set_boss_poise(v: float, m: float) -> void:
	_poise_bar.set_values(v, m)


func set_player_health(v: float, m: float) -> void:
	var dropped := v < _player_bar.value - 0.01
	_player_bar.set_values(v, m)
	_low_hp = v > 0.0 and v / m < 0.3
	if dropped:
		_hurt.modulate.a = 0.7
		_tween().tween_property(_hurt, "modulate:a", 0.0, 0.6)


func flash(color: Color, duration: float) -> void:
	_flash.color = color
	_tween().tween_property(_flash, "color:a", 0.0, duration)


func message(text: String, color: Color = Color(1.0, 0.9, 0.6), hold: float = 0.6, size: int = 64) -> void:
	_center.text = text
	_center.label_settings.font_color = color
	_center.label_settings.font_size = size
	_center.modulate.a = 1.0
	_center.scale = Vector2(1.5, 1.5)
	var tw := _tween()
	tw.tween_property(_center, "scale", Vector2.ONE, 0.16).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	tw.tween_interval(hold)
	tw.tween_property(_center, "modulate:a", 0.0, 0.3)


func register_hit() -> void:
	_combo_count += 1
	_combo_timer = 2.2
	if _combo_count >= 2:
		_combo.text = "%d HITS" % _combo_count
		_combo.modulate.a = 1.0
		_combo.scale = Vector2(1.35, 1.35)
		_tween().tween_property(_combo, "scale", Vector2.ONE, 0.15).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)


func show_prompt(text: String) -> void:
	_prompt.text = text
	_prompt.visible = true
	_prompt_t = 0.0


func hide_prompt() -> void:
	_prompt.visible = false


func show_title(hold: float) -> void:
	var tw := _tween().set_parallel(true)
	for c: CanvasItem in [_title, _ornament, _subtitle]:
		tw.tween_property(c, "modulate:a", 1.0, 0.35)
	_title.scale = Vector2(1.12, 1.12)
	tw.tween_property(_title, "scale", Vector2.ONE, hold + 0.6).set_ease(Tween.EASE_OUT)
	var tw2 := _tween()
	tw2.tween_interval(hold)
	tw2.tween_property(_title, "modulate:a", 0.0, 0.45)
	tw2.parallel().tween_property(_ornament, "modulate:a", 0.0, 0.45)
	tw2.parallel().tween_property(_subtitle, "modulate:a", 0.0, 0.45)


func set_letterbox(on: bool) -> void:
	_letterbox_target = 1.0 if on else 0.0


func set_bars_visible(on: bool, instant: bool = false) -> void:
	var a := 1.0 if on else 0.0
	var items: Array[CanvasItem] = [_boss_name, _boss_bar, _poise_bar, _player_name, _player_bar, _combo]
	if instant:
		for c in items:
			c.modulate.a = a if c != _combo else 0.0
		return
	var tw := _tween().set_parallel(true)
	for c in items:
		tw.tween_property(c, "modulate:a", a if c != _combo else 0.0, 0.35)


func show_end(victory: bool, touch: bool) -> void:
	_end_title.text = "VICTORY" if victory else "YOU HAVE FALLEN"
	_end_title.label_settings.font_color = Color(1.0, 0.84, 0.45) if victory else Color(0.95, 0.35, 0.25)
	if not victory:
		_end_title.label_settings.font_size = 60 if portrait else 84
	_end_sub.text = "The Star-Eater returns to the dust" if victory else "The stars claim the Atlas tonight"
	_end_hint.text = ("Tap to fight again" if touch else "Press  R  to fight again")
	for c: CanvasItem in [_end_title, _end_sub, _end_hint]:
		c.visible = true
		c.modulate.a = 0.0
	_end_title.scale = Vector2(1.4, 1.4)
	var tw := _tween().set_parallel(true)
	tw.tween_property(_end_title, "modulate:a", 1.0, 0.35)
	tw.tween_property(_end_title, "scale", Vector2.ONE, 0.5).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	tw.tween_property(_end_sub, "modulate:a", 1.0, 0.5).set_delay(0.3)
	tw.tween_property(_end_hint, "modulate:a", 1.0, 0.5).set_delay(0.6)

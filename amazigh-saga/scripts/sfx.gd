extends Node
## Procedurally synthesised sound effects and a frame-drum war rhythm.
## Everything is generated at start-up into AudioStreamWAV buffers, so the
## project ships without any audio files.

const RATE := 22050

var streams := {}
var _players: Array[AudioStreamPlayer] = []
var _next := 0
var _music: AudioStreamPlayer
var _rng := RandomNumberGenerator.new()


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	_rng.seed = 1234
	# Headroom plus a hard limiter on the Master bus so stacked impacts never clip.
	AudioServer.set_bus_volume_db(0, -4.0)
	var limiter := AudioEffectHardLimiter.new()
	limiter.ceiling_db = -1.0
	AudioServer.add_bus_effect(0, limiter)
	for i in 24:
		var p := AudioStreamPlayer.new()
		add_child(p)
		_players.append(p)
	_music = AudioStreamPlayer.new()
	_music.volume_db = -9.0
	add_child(_music)
	_build_all()


func play(sound: String, volume_db: float = 0.0, pitch: float = 1.0) -> void:
	if not streams.has(sound):
		return
	var p := _players[_next]
	_next = (_next + 1) % _players.size()
	p.stream = streams[sound]
	p.volume_db = volume_db
	p.pitch_scale = pitch * _rng.randf_range(0.96, 1.04)
	p.play()


func set_bus(bus_name: String) -> void:
	for p in _players:
		p.bus = bus_name


func start_music() -> void:
	if streams.has("drums") and not _music.playing:
		_music.stream = streams["drums"]
		_music.play()


func stop_music() -> void:
	_music.stop()


func set_music_volume(db: float) -> void:
	_music.volume_db = db


# ---------------------------------------------------------------- synthesis

func _buf(seconds: float) -> PackedFloat32Array:
	var b := PackedFloat32Array()
	b.resize(int(seconds * RATE))
	return b


func _stream(data: PackedFloat32Array, loop: bool = false) -> AudioStreamWAV:
	var bytes := PackedByteArray()
	bytes.resize(data.size() * 2)
	for i in data.size():
		bytes.encode_s16(i * 2, int(clampf(data[i], -1.0, 1.0) * 32000.0))
	var s := AudioStreamWAV.new()
	s.format = AudioStreamWAV.FORMAT_16_BITS
	s.mix_rate = RATE
	s.stereo = false
	s.data = bytes
	if loop:
		s.loop_mode = AudioStreamWAV.LOOP_FORWARD
		s.loop_begin = 0
		s.loop_end = data.size()
	return s


func _noise() -> float:
	return _rng.randf() * 2.0 - 1.0


func _build_all() -> void:
	streams["whoosh"] = _stream(_whoosh(0.26, 0.08, 0.4))
	streams["whoosh_heavy"] = _stream(_whoosh(0.42, 0.04, 0.22))
	streams["hit"] = _stream(_impact(150.0, 48.0, 0.32, 0.9))
	streams["hit_heavy"] = _stream(_impact(120.0, 36.0, 0.55, 1.0))
	streams["clang"] = _stream(_metal(1.0, 0.85))
	streams["parry"] = _stream(_metal(1.45, 1.1))
	streams["boom"] = _stream(_boom(1.4))
	streams["roar"] = _stream(_roar(1.35, 58.0))
	streams["screech"] = _stream(_screech(0.4))
	streams["step"] = _stream(_impact(90.0, 50.0, 0.1, 0.35))
	streams["rift"] = _stream(_rift(1.6))
	streams["victory"] = _stream(_victory(2.6))
	streams["drums"] = _stream(_drums(), true)


func _whoosh(dur: float, a_lo: float, a_hi: float) -> PackedFloat32Array:
	var b := _buf(dur)
	var lp := 0.0
	var lp2 := 0.0
	for i in b.size():
		var t := float(i) / RATE
		var x := t / dur
		var env := pow(sin(PI * x), 2.0)
		var a := lerpf(a_lo, a_hi, sin(PI * minf(x * 1.3, 1.0)))
		lp += a * (_noise() - lp)
		lp2 += a * (lp - lp2)
		b[i] = (lp - lp2 * 0.6) * env * 2.2
	return b


func _impact(f0: float, f1: float, dur: float, gain: float) -> PackedFloat32Array:
	var b := _buf(dur)
	var ph := 0.0
	var lp := 0.0
	for i in b.size():
		var t := float(i) / RATE
		var f := lerpf(f1, f0, exp(-t * 30.0))
		ph += TAU * f / RATE
		var body := sin(ph) * exp(-t * 14.0)
		lp += 0.35 * (_noise() - lp)
		var crunch := lp * exp(-t * 38.0)
		var v := body * 0.9 + crunch * 0.8
		b[i] = tanh(v * 1.8) * gain
	return b


func _metal(pitch: float, gain: float) -> PackedFloat32Array:
	var dur := 0.9
	var b := _buf(dur)
	var freqs := [620.0, 1183.0, 1712.0, 2634.0, 3391.0, 4410.0]
	var decays := [4.5, 5.5, 7.0, 9.0, 11.0, 14.0]
	var amps := [0.5, 0.42, 0.33, 0.25, 0.18, 0.12]
	for i in b.size():
		var t := float(i) / RATE
		var v := 0.0
		for k in freqs.size():
			v += sin(TAU * float(freqs[k]) * pitch * t) * float(amps[k]) * exp(-t * float(decays[k]))
		v += _noise() * exp(-t * 60.0) * 0.6
		b[i] = v * gain * 0.7
	return b


func _boom(dur: float) -> PackedFloat32Array:
	var b := _buf(dur)
	var ph := 0.0
	var lp := 0.0
	var lp2 := 0.0
	for i in b.size():
		var t := float(i) / RATE
		var f := lerpf(28.0, 85.0, exp(-t * 7.0))
		ph += TAU * f / RATE
		lp += 0.06 * (_noise() - lp)
		lp2 += 0.06 * (lp - lp2)
		var v := sin(ph) * exp(-t * 3.2) * 1.1 + lp2 * 4.0 * exp(-t * 2.5) + _noise() * exp(-t * 45.0) * 0.4
		b[i] = tanh(v * 1.5)
	return b


func _roar(dur: float, base: float) -> PackedFloat32Array:
	var b := _buf(dur)
	var ph := 0.0
	var ph2 := 0.0
	var lp := 0.0
	var lpn := 0.0
	for i in b.size():
		var t := float(i) / RATE
		var env := minf(t / 0.12, 1.0) * clampf((dur - t) / 0.45, 0.0, 1.0)
		var f := base * (1.0 + 0.25 * sin(t * 3.0)) * (1.0 + 0.04 * sin(t * 47.0))
		ph += f / RATE
		var saw := 2.0 * fmod(ph, 1.0) - 1.0
		lp += 0.18 * (saw - lp)
		var growl := lp * (0.6 + 0.4 * sin(TAU * 31.0 * t))
		ph2 += TAU * (780.0 - 260.0 * t / dur + 40.0 * sin(t * 22.0)) / RATE
		var screech := sin(ph2) * 0.16
		lpn += 0.25 * (_noise() - lpn)
		b[i] = tanh((growl * 1.6 + screech + lpn * 0.5) * env * 1.4) * 0.9
	return b


func _screech(dur: float) -> PackedFloat32Array:
	var b := _buf(dur)
	var ph := 0.0
	for i in b.size():
		var t := float(i) / RATE
		var env := minf(t / 0.02, 1.0) * exp(-t * 6.0)
		ph += TAU * (1250.0 - 1500.0 * t + 90.0 * sin(t * 70.0)) / RATE
		b[i] = (sin(ph) * 0.6 + sin(ph * 1.51) * 0.3 + _noise() * 0.25) * env * 0.8
	return b


func _rift(dur: float) -> PackedFloat32Array:
	var b := _buf(dur)
	var ph := 0.0
	var lp := 0.0
	for i in b.size():
		var t := float(i) / RATE
		var x := t / dur
		ph += TAU * (90.0 + 600.0 * x * x) / RATE
		lp += 0.1 * (_noise() - lp)
		var env := sin(PI * minf(x * 1.1, 1.0))
		b[i] = (sin(ph) * 0.35 + sin(ph * 2.02) * 0.2 + lp * 1.2) * env * 0.8
	return b


func _victory(dur: float) -> PackedFloat32Array:
	# Rising pentatonic phrase over a sustained drone.
	var b := _buf(dur)
	var notes := [220.0, 261.63, 293.66, 329.63, 392.0, 440.0]
	for i in b.size():
		var t := float(i) / RATE
		var v := sin(TAU * 110.0 * t) * 0.18 * minf(t / 0.3, 1.0) * clampf((dur - t) / 0.8, 0.0, 1.0)
		for k in notes.size():
			var st := 0.16 * k
			if t >= st:
				var tt := t - st
				var f: float = notes[k]
				v += (sin(TAU * f * tt) + 0.3 * sin(TAU * f * 2.0 * tt)) * exp(-tt * 2.2) * 0.22
		b[i] = tanh(v * 1.2) * 0.85
	return b


func _drums() -> PackedFloat32Array:
	# Two bars of a 6/8-feel frame-drum rhythm with a low drone underneath.
	var bpm := 104.0
	var eighth := 60.0 / bpm / 2.0
	var steps := 24
	var dur := eighth * steps
	var b := _buf(dur)
	var low := _impact(115.0, 52.0, 0.5, 0.95)
	var high := _slap(0.18)
	var pattern_low := [0, 3, 6, 9, 10, 12, 15, 18, 21, 22]
	var pattern_high := [2, 5, 8, 11, 14, 17, 20, 23]
	for s in pattern_low:
		_mix_into(b, low, int(float(s) * eighth * RATE), 0.75 if s % 3 == 0 else 0.45)
	for s in pattern_high:
		_mix_into(b, high, int(float(s) * eighth * RATE), 0.35)
	for i in b.size():
		var t := float(i) / RATE
		var drone := sin(TAU * 55.0 * t) * 0.10 + sin(TAU * 82.5 * t) * 0.06
		drone *= 0.8 + 0.2 * sin(TAU * t / dur * 2.0)
		b[i] = tanh((b[i] + drone) * 1.1) * 0.8
	return b


func _slap(dur: float) -> PackedFloat32Array:
	var b := _buf(dur)
	var lp := 0.0
	for i in b.size():
		var t := float(i) / RATE
		lp += 0.5 * (_noise() - lp)
		b[i] = (lp * exp(-t * 35.0) + sin(TAU * 340.0 * t) * exp(-t * 28.0) * 0.5) * 0.8
	return b


func _mix_into(dst: PackedFloat32Array, src: PackedFloat32Array, at: int, gain: float) -> void:
	for i in src.size():
		var j := at + i
		if j >= dst.size():
			break
		dst[j] += src[i] * gain


func _exit_tree() -> void:
	# Release playing streams so nothing is left alive at shutdown.
	for p in _players:
		p.stop()
		p.stream = null
	_music.stop()
	_music.stream = null
	streams.clear()

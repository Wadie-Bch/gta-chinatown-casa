class_name TrailerScore
extends RefCounted
## Original procedural score for the portrait reel, synthesised sample by sample.
## D minor with a Hijaz (augmented-second) colour: string pads, a formant choir,
## low "braam" swells, a breathy ney-like lead, taiko-style drums, darbuka
## doum/tek and frame drum. Hits are placed on the trailer's cut and impact times.

const RATE := 32000
const LENGTH := 42.4

## Gameplay moments inside the combat shots that get an extra stinger.
const COMBAT_STINGERS := [16.53, 19.17]
const FINISHER_STRIKE := 35.27

static var L: PackedFloat32Array
static var R: PackedFloat32Array
static var _rng := RandomNumberGenerator.new()


static func build() -> AudioStreamWAV:
	var n := int(LENGTH * RATE)
	L = PackedFloat32Array()
	L.resize(n)
	R = PackedFloat32Array()
	R.resize(n)
	_rng.seed = 4242
	_compose()
	return _master()


static func hz(midi: float) -> float:
	return 440.0 * pow(2.0, (midi - 69.0) / 12.0)


static func _noise() -> float:
	return _rng.randf() * 2.0 - 1.0


static func _range(t0: float, dur: float) -> Vector2i:
	var i0 := clampi(int(t0 * RATE), 0, L.size())
	var i1 := clampi(int((t0 + dur) * RATE), 0, L.size())
	return Vector2i(i0, i1)


# ---------------------------------------------------------------- instruments

## Detuned saw ensemble through a one-pole low-pass, slow attack/release.
static func pad(t0: float, dur: float, notes: Array, gain: float, cutoff: float = 1400.0,
		attack: float = 0.7, release: float = 1.0, cutoff_end: float = -1.0) -> void:
	if cutoff_end < 0.0:
		cutoff_end = cutoff
	var r := _range(t0, dur + release)
	var detune := [-0.0055, 0.0, 0.0048]
	var pans := [-0.7, 0.0, 0.7]
	var k := 0
	for note in notes:
		var f := hz(float(note))
		for v in 3:
			var fv := f * (1.0 + float(detune[v]))
			var ph := _rng.randf()
			var lp := 0.0
			var pan: float = clampf(float(pans[v]) * 0.8 + (k % 2) * 0.15 - 0.07, -0.9, 0.9)
			var gl := sqrt(0.5 * (1.0 - pan))
			var gr := sqrt(0.5 * (1.0 + pan))
			for i in range(r.x, r.y):
				var tt := float(i - r.x) / RATE
				var env := minf(tt / attack, 1.0)
				if tt > dur:
					env *= maxf(1.0 - (tt - dur) / release, 0.0)
				env = env * env * (3.0 - 2.0 * env)
				var vib := 1.0 + 0.0025 * sin(TAU * 4.6 * tt + float(k + v))
				ph += fv * vib / RATE
				ph -= floor(ph)
				var c := lerpf(cutoff, cutoff_end, clampf(tt / maxf(dur, 0.01), 0.0, 1.0))
				var a := 1.0 - exp(-TAU * c / RATE)
				lp += a * ((2.0 * ph - 1.0) - lp)
				var o := lp * env * gain / (3.0 * maxf(float(notes.size()), 1.0)) * 2.2
				L[i] += o * gl
				R[i] += o * gr
		k += 1


## Formant-filtered saws ("ah") for a wordless choir (three band-pass biquads).
static func choir(t0: float, dur: float, notes: Array, gain: float, attack: float = 1.0, release: float = 1.4) -> void:
	var r := _range(t0, dur + release)
	var c1 := _bp(730.0, 6.0)
	var c2 := _bp(1090.0, 6.0)
	var c3 := _bp(2440.0, 6.0)
	var k := 0
	for note in notes:
		var f := hz(float(note))
		var pan := (float(k) / maxf(float(notes.size() - 1), 1.0)) * 1.2 - 0.6
		var gl := sqrt(0.5 * (1.0 - pan))
		var gr := sqrt(0.5 * (1.0 + pan))
		var b1: float = c1.x
		var a11: float = c1.y
		var a21: float = c1.z
		var b2: float = c2.x
		var a12: float = c2.y
		var a22: float = c2.z
		var b3: float = c3.x
		var a13: float = c3.y
		var a23: float = c3.z
		var x1 := 0.0
		var x2 := 0.0
		var y11 := 0.0
		var y12 := 0.0
		var y21 := 0.0
		var y22 := 0.0
		var y31 := 0.0
		var y32 := 0.0
		var ph := _rng.randf()
		var ph2 := _rng.randf()
		var norm := gain / maxf(float(notes.size()), 1.0) * 2.5
		for i in range(r.x, r.y):
			var tt := float(i - r.x) / RATE
			var env := minf(tt / attack, 1.0)
			if tt > dur:
				env *= maxf(1.0 - (tt - dur) / release, 0.0)
			var vib := 1.0 + 0.006 * sin(TAU * 5.3 * tt + float(k)) * minf(tt / 0.8, 1.0)
			ph += f * vib / RATE
			ph -= floor(ph)
			ph2 += f * 1.004 * vib / RATE
			ph2 -= floor(ph2)
			var x := (2.0 * ph - 1.0) + (2.0 * ph2 - 1.0) * 0.8
			var o1 := b1 * (x - x2) - a11 * y11 - a21 * y12
			var o2 := b2 * (x - x2) - a12 * y21 - a22 * y22
			var o3 := b3 * (x - x2) - a13 * y31 - a23 * y32
			x2 = x1
			x1 = x
			y12 = y11
			y11 = o1
			y22 = y21
			y21 = o2
			y32 = y31
			y31 = o3
			var o := (o1 + o2 * 0.55 + o3 * 0.3) * env * norm
			L[i] += o * gl
			R[i] += o * gr
		k += 1


## Band-pass biquad (constant peak gain): returns (b0, a1, a2) with b2 = -b0.
static func _bp(freq: float, q: float) -> Vector3:
	var w0 := TAU * freq / RATE
	var alpha := sin(w0) / (2.0 * q)
	var a0 := 1.0 + alpha
	return Vector3(alpha / a0, -2.0 * cos(w0) / a0, (1.0 - alpha) / a0)


## Low brass-like "braam": stacked saws, opening/closing filter, saturation.
static func braam(t0: float, dur: float, root_midi: float, gain: float) -> void:
	var r := _range(t0, dur)
	var f := hz(root_midi)
	var parts := [[1.0, 1.0], [1.007, 0.9], [2.0, 0.8], [1.995, 0.7], [3.0, 0.45], [4.0, 0.35], [0.5, 0.45]]
	var ph := []
	for p in parts:
		ph.append(_rng.randf())
	var lp := 0.0
	var lp2 := 0.0
	for i in range(r.x, r.y):
		var tt := float(i - r.x) / RATE
		var env := minf(tt / 0.04, 1.0) * pow(maxf(1.0 - tt / dur, 0.0), 1.4)
		var cut := 140.0 + 2300.0 * exp(-tt * 2.2) * minf(tt / 0.12, 1.0)
		var a := 1.0 - exp(-TAU * cut / RATE)
		var s := 0.0
		for j in parts.size():
			var pp: Array = parts[j]
			ph[j] = float(ph[j]) + f * float(pp[0]) / RATE
			ph[j] = float(ph[j]) - floor(float(ph[j]))
			s += (2.0 * float(ph[j]) - 1.0) * float(pp[1])
		lp += a * (s - lp)
		lp2 += a * (lp - lp2)
		var o := tanh(lp2 * 1.8) * env * gain * 0.55
		L[i] += o * (1.0 + 0.1 * sin(tt * 3.0))
		R[i] += o * (1.0 - 0.1 * sin(tt * 3.0))


## Big drum: pitched membrane + noise slap.
static func taiko(t0: float, gain: float, f0: float = 120.0, f1: float = 48.0, decay: float = 7.0, pan: float = 0.0) -> void:
	var r := _range(t0, 1.2)
	var ph := 0.0
	var lp := 0.0
	var gl := sqrt(0.5 * (1.0 - pan))
	var gr := sqrt(0.5 * (1.0 + pan))
	for i in range(r.x, r.y):
		var tt := float(i - r.x) / RATE
		var f := lerpf(f1, f0, exp(-tt * 28.0))
		ph += TAU * f / RATE
		lp += 0.25 * (_noise() - lp)
		var o := (sin(ph) * exp(-tt * decay) + lp * exp(-tt * 45.0) * 0.7) * gain
		o = tanh(o * 1.4)
		L[i] += o * gl
		R[i] += o * gr


static func sub_boom(t0: float, gain: float, dur: float = 2.4) -> void:
	var r := _range(t0, dur)
	var ph := 0.0
	for i in range(r.x, r.y):
		var tt := float(i - r.x) / RATE
		var f := lerpf(28.0, 72.0, exp(-tt * 5.0))
		ph += TAU * f / RATE
		var o := sin(ph) * exp(-tt * 1.9) * gain
		L[i] += o
		R[i] += o


static func crash(t0: float, gain: float, dur: float = 2.2) -> void:
	var r := _range(t0, dur)
	var hp := 0.0
	var prev := 0.0
	var lp := 0.0
	for i in range(r.x, r.y):
		var tt := float(i - r.x) / RATE
		var x := _noise()
		hp = 0.92 * (hp + x - prev)
		prev = x
		lp += 0.5 * (hp - lp)
		var o := lp * exp(-tt * 2.4) * gain * 0.6
		L[i] += o * (0.8 + 0.2 * _noise())
		R[i] += o * (0.8 + 0.2 * _noise())


## Inharmonic metal strike in the 1-5 kHz range: what phone speakers can play.
static func clang(t0: float, gain: float, pitch: float = 1.0) -> void:
	var r := _range(t0, 1.0)
	var freqs := [1180.0, 1720.0, 2630.0, 3390.0, 4410.0]
	var amps := [0.5, 0.42, 0.32, 0.22, 0.15]
	for i in range(r.x, r.y):
		var tt := float(i - r.x) / RATE
		var v := 0.0
		for k in freqs.size():
			v += sin(TAU * float(freqs[k]) * pitch * tt) * float(amps[k]) * exp(-tt * (6.0 + 3.0 * k))
		v += _noise() * exp(-tt * 70.0) * 0.5
		var o := v * gain * 0.5
		L[i] += o * 1.05
		R[i] += o * 0.95


## A trailer hit: sub boom, drum stack, crash and a bright transient on top.
static func hit(t0: float, gain: float) -> void:
	sub_boom(t0, 0.6 * gain)
	taiko(t0, 0.9 * gain, 110.0, 42.0, 5.0, -0.2)
	taiko(t0 + 0.012, 0.75 * gain, 170.0, 70.0, 9.0, 0.25)
	crash(t0, 0.75 * gain)
	clang(t0, 0.45 * gain, 0.9 + 0.2 * _rng.randf())
	tek(t0, 0.5 * gain, 0.0)


static func doum(t0: float, gain: float) -> void:
	taiko(t0, gain, 140.0, 70.0, 11.0, -0.1)


static func tek(t0: float, gain: float, pan: float = 0.2) -> void:
	var r := _range(t0, 0.12)
	var ph := 0.0
	var hp := 0.0
	var prev := 0.0
	var gl := sqrt(0.5 * (1.0 - pan))
	var gr := sqrt(0.5 * (1.0 + pan))
	for i in range(r.x, r.y):
		var tt := float(i - r.x) / RATE
		var x := _noise()
		hp = 0.8 * (hp + x - prev)
		prev = x
		ph += TAU * 620.0 / RATE
		var o := (hp * 0.7 + sin(ph) * 0.5) * exp(-tt * 55.0) * gain
		L[i] += o * gl
		R[i] += o * gr


## Frame drum with jingling rattle.
static func bendir(t0: float, gain: float) -> void:
	taiko(t0, gain * 0.8, 95.0, 55.0, 9.0, 0.1)
	var r := _range(t0, 0.25)
	var hp := 0.0
	var prev := 0.0
	for i in range(r.x, r.y):
		var tt := float(i - r.x) / RATE
		var x := _noise()
		hp = 0.95 * (hp + x - prev)
		prev = x
		var buzz := 0.6 + 0.4 * sin(TAU * 40.0 * tt)
		var o := hp * exp(-tt * 18.0) * buzz * gain * 0.25
		L[i] += o * 0.8
		R[i] += o * 1.1


## Short bowed string note for ostinatos.
static func stac(t0: float, midi: float, gain: float, dur: float = 0.16, pan: float = 0.0) -> void:
	var r := _range(t0, dur + 0.08)
	var f := hz(midi)
	var ph := _rng.randf()
	var ph2 := _rng.randf()
	var lp := 0.0
	var gl := sqrt(0.5 * (1.0 - pan))
	var gr := sqrt(0.5 * (1.0 + pan))
	var a := 1.0 - exp(-TAU * 1900.0 / RATE)
	for i in range(r.x, r.y):
		var tt := float(i - r.x) / RATE
		var env := minf(tt / 0.008, 1.0) * (exp(-tt * 9.0) if tt < dur else exp(-dur * 9.0) * maxf(1.0 - (tt - dur) / 0.08, 0.0))
		ph += f / RATE
		ph -= floor(ph)
		ph2 += f * 1.006 / RATE
		ph2 -= floor(ph2)
		lp += a * (((2.0 * ph - 1.0) + (2.0 * ph2 - 1.0)) * 0.5 - lp)
		var o := lp * env * gain
		L[i] += o * gl
		R[i] += o * gr


## Breathy end-blown flute (ney-like) phrase with legato glides and vibrato.
static func ney(phrase: Array, gain: float) -> void:
	# phrase: [[t0, dur, midi], ...]
	var prev_f := -1.0
	for n: Array in phrase:
		var t0: float = n[0]
		var dur: float = n[1]
		var f := hz(float(n[2]))
		var r := _range(t0, dur + 0.25)
		var ph := 0.0
		var bp := 0.0
		var bp2 := 0.0
		var start_f := f if prev_f < 0.0 else prev_f
		for i in range(r.x, r.y):
			var tt := float(i - r.x) / RATE
			var env := minf(tt / 0.07, 1.0)
			if tt > dur:
				env *= maxf(1.0 - (tt - dur) / 0.25, 0.0)
			var glide := lerpf(start_f, f, minf(tt / 0.06, 1.0))
			var vib := 1.0 + 0.007 * sin(TAU * 5.4 * tt) * smoothstep(0.12, 0.45, tt)
			ph += TAU * glide * vib / RATE
			var tone := sin(ph) + 0.22 * sin(2.0 * ph) + 0.08 * sin(3.0 * ph)
			var x := _noise()
			bp += 0.3 * (x - bp)
			bp2 += 0.3 * (bp - bp2)
			var breath := (bp - bp2) * 0.9 * (0.6 + 0.4 * env)
			var o := (tone * 0.75 + breath * 0.35) * env * gain
			L[i] += o * 0.92
			R[i] += o * 1.0
		prev_f = f


static func bells(t0: float, midis: Array, step: float, gain: float) -> void:
	var k := 0
	for m in midis:
		var f := hz(float(m))
		var r := _range(t0 + k * step, 2.2)
		var pan := 0.6 if k % 2 == 0 else -0.6
		var gl := sqrt(0.5 * (1.0 - pan))
		var gr := sqrt(0.5 * (1.0 + pan))
		for i in range(r.x, r.y):
			var tt := float(i - r.x) / RATE
			var o := (sin(TAU * f * tt) + 0.4 * sin(TAU * f * 2.76 * tt) * exp(-tt * 3.0)) * exp(-tt * 2.0) * minf(tt / 0.004, 1.0) * gain
			L[i] += o * gl
			R[i] += o * gr
		k += 1


static func riser(t0: float, dur: float, gain: float) -> void:
	var r := _range(t0, dur)
	var lp := 0.0
	var lp2 := 0.0
	var ph := 0.0
	for i in range(r.x, r.y):
		var tt := float(i - r.x) / RATE
		var k := tt / dur
		var c := lerpf(300.0, 7000.0, k * k)
		var a := 1.0 - exp(-TAU * c / RATE)
		lp += a * (_noise() - lp)
		lp2 += a * (lp - lp2)
		ph += TAU * lerpf(180.0, 1400.0, k * k) / RATE
		var o := ((lp - lp2) * 1.4 + sin(ph) * 0.15) * pow(k, 2.0) * gain
		L[i] += o * (0.9 + 0.1 * sin(tt * 9.0))
		R[i] += o * (0.9 - 0.1 * sin(tt * 9.0))


static func reverse_swell(t_end: float, dur: float, gain: float) -> void:
	var r := _range(t_end - dur, dur)
	var lp := 0.0
	for i in range(r.x, r.y):
		var tt := float(i - r.x) / RATE
		var k := tt / dur
		lp += (0.08 + 0.5 * k) * (_noise() - lp)
		var o := lp * pow(k, 3.0) * gain
		L[i] += o
		R[i] += o * 0.95


# ---------------------------------------------------------------- composition

static func _compose() -> void:
	# ---- 0–4 THE OMEN: drone, eerie choir, stars going out, harbinger braam
	pad(0.0, 4.0, [38, 45], 0.3, 220.0, 1.2, 0.4, 700.0)
	bells(0.08, [86, 93], 0.12, 0.09)
	choir(0.3, 3.6, [62, 69], 0.12, 1.2, 0.6)
	choir(2.2, 1.7, [63], 0.07, 1.0, 0.4)
	var star_notes := [86, 81, 89, 86, 81, 77]
	for i in star_notes.size():
		bells(0.35 + i * 0.38, [star_notes[i]], 0.0, 0.06 * (1.0 - i * 0.12))
	braam(2.3, 2.0, 38, 0.32)
	reverse_swell(4.0, 1.4, 0.3)
	hit(4.0, 0.85)

	# ---- 4–10 THE FALLEN GUARDIAN: D minor progression, ney theme, frame drum
	var prog := [[4.0, [50, 53, 57, 62], 38], [5.5, [46, 50, 53, 58], 34], [7.0, [43, 50, 55, 58], 31], [8.5, [45, 52, 57, 61], 33]]
	for c: Array in prog:
		pad(float(c[0]), 1.5, c[1], 0.34, 1500.0, 0.45, 0.7)
		pad(float(c[0]), 1.5, [c[2]], 0.3, 320.0, 0.2, 0.6)
	ney([[4.55, 0.45, 69], [5.0, 0.85, 74], [5.85, 0.25, 73], [6.1, 0.35, 74], [6.45, 0.4, 76], [6.85, 0.95, 77]], 0.2)
	ney([[8.6, 0.3, 73], [8.9, 0.3, 74], [9.2, 0.75, 76]], 0.2)
	choir(7.8, 0.7, [62, 65, 69], 0.11, 0.25, 0.5)
	sub_boom(7.85, 0.35, 1.2)
	sub_boom(8.25, 0.25, 1.0)
	var bt := 4.0
	while bt < 9.4:
		var acc := 1.0 if int(round((bt - 4.0) / 0.6)) % 4 == 0 else 0.6
		if bt < 7.8 or bt >= 8.6:
			bendir(bt, 0.22 * acc * (0.7 + 0.3 * (bt - 4.0) / 5.4))
		bt += 0.6
	riser(8.7, 1.3, 0.3)
	reverse_swell(10.0, 1.0, 0.3)

	# ---- 10–12 THE INVASION: landing hits, ostinato, drum roll
	hit(10.0, 0.8)
	braam(10.0, 1.4, 38, 0.3)
	for lt: float in [10.45, 10.95, 11.45]:
		hit(lt, 0.55)
	var pat := [50, 50, 53, 50, 51, 50, 49, 50]
	var st := 10.0
	var k := 0
	while st < 12.0:
		stac(st, float(pat[k % 8]), 0.16 + 0.06 * (st - 10.0) / 2.0, 0.16, -0.3 if k % 2 == 0 else 0.3)
		st += 0.25
		k += 1
	var rt := 11.6
	while rt < 12.0:
		taiko(rt, 0.25 + (rt - 11.6) * 1.2, 150.0, 70.0, 12.0, 0.15)
		rt += 0.0625

	# ---- 12–20 COMBAT: 120 bpm groove, ostinato, stabs
	var bars := [[50, 50, 53, 50, 51, 50, 49, 50], [50, 50, 53, 50, 51, 50, 49, 50],
			[55, 55, 58, 55, 56, 55, 54, 55], [50, 53, 55, 57, 58, 57, 55, 53]]
	var basses := [38, 38, 43, 45]
	for b in 4:
		var b0 := 12.0 + b * 2.0
		pad(b0, 2.0, [basses[b]], 0.32, 260.0, 0.05, 0.3)
		for e in 8:
			stac(b0 + e * 0.25, float(bars[b][e]), 0.17, 0.15, -0.35 if e % 2 == 0 else 0.35)
			stac(b0 + e * 0.25, float(bars[b][e]) + 12.0, 0.06, 0.12, 0.5 if e % 2 == 0 else -0.5)
		for beat in [0.0, 1.5, 2.0, 3.25]:
			if b == 3 and beat > 3.0:
				continue
			taiko(b0 + beat * 0.5, 0.6, 115.0, 45.0, 6.5, -0.15)
		for s16 in 16:
			var tt := b0 + s16 * 0.125
			if s16 % 4 == 0:
				doum(tt, 0.32)
			else:
				tek(tt, 0.12 if s16 % 2 == 1 else 0.18, 0.3 if s16 % 2 == 0 else -0.3)
		braam(b0, 0.45, 38 if b != 2 else 43, 0.22)
	choir(16.0, 3.8, [50, 57, 62], 0.08, 1.5, 0.4)
	pad(12.0, 7.9, [50, 57], 0.2, 900.0, 0.3, 0.2)
	for s: float in COMBAT_STINGERS:
		hit(s, 0.45)
	riser(19.0, 1.0, 0.3)
	reverse_swell(20.0, 0.9, 0.3)

	# ---- 20–29 THE STAR EATER: braams, dread choir, heartbeat, blade shimmer
	hit(20.0, 1.0)
	braam(20.0, 3.0, 38, 0.62)
	braam(23.2, 2.8, 39, 0.55)
	braam(26.0, 1.8, 38, 0.5)
	sub_boom(23.2, 0.6)
	sub_boom(26.0, 0.5)
	choir(20.2, 2.9, [50, 53, 57], 0.12, 1.0, 0.6)
	choir(23.2, 2.7, [51, 55, 58], 0.13, 0.8, 0.6)
	choir(26.0, 2.9, [50, 53, 57, 62, 69], 0.15, 1.0, 0.4)
	for hb: float in [21.0, 22.2, 24.6, 27.0, 27.9, 28.4]:
		taiko(hb, 0.45, 90.0, 40.0, 6.0)
		taiko(hb + 0.28, 0.32, 90.0, 40.0, 7.0)
	bells(27.6, [74, 81, 86, 89, 93], 0.09, 0.07)
	riser(27.8, 1.2, 0.32)
	reverse_swell(29.0, 1.0, 0.32)

	# ---- 29–37.3 FINAL MONTAGE: driving 16ths, hits on every cut, finisher
	hit(29.0, 1.0)
	taiko(29.0, 0.7, 120.0, 45.0, 5.0, 0.0)
	for ct: float in [30.0, 30.9, 31.9, 32.8, 33.6]:
		hit(ct, 0.75)
	hit(31.3, 0.7)
	hit(32.32, 0.6)
	braam(29.0, 1.0, 38, 0.3)
	braam(33.6, 1.6, 38, 0.4)
	var mt := 29.0
	var mk := 0
	var mpat := [50, 50, 53, 50, 51, 50, 49, 50, 50, 53, 55, 57, 58, 57, 55, 53]
	while mt < 37.15:
		stac(mt, float(mpat[mk % 16]), 0.13 if mt < 33.6 else 0.09, 0.1, -0.3 if mk % 2 == 0 else 0.3)
		if mk % 4 == 0:
			doum(mt, 0.3)
		else:
			tek(mt, 0.13, 0.3 if mk % 2 == 0 else -0.3)
		if mk % 8 == 0:
			taiko(mt, 0.5, 110.0, 44.0, 6.0)
		mt += 0.125
		mk += 1
	pad(29.0, 4.6, [38, 50], 0.28, 400.0, 0.1, 0.4)
	choir(33.6, 3.5, [50, 57, 62, 65, 69], 0.08, 0.6, 0.3)
	ney([[34.0, 0.6, 74], [34.6, 0.35, 75], [34.95, 0.35, 74], [35.3, 0.4, 73], [35.7, 1.1, 74]], 0.11)
	hit(FINISHER_STRIKE, 1.0)
	braam(FINISHER_STRIKE, 1.8, 38, 0.45)
	riser(35.9, 1.4, 0.42)
	choir(35.8, 1.45, [57, 62, 69], 0.13, 0.4, 0.05)
	reverse_swell(37.6, 0.35, 0.35)

	# ---- 37.6– TITLE: final hit, D major (Hijaz tonic) ring-out, ney cadence
	hit(37.6, 1.3)
	clang(37.6, 0.6, 0.75)
	crash(37.6, 0.6, 3.0)
	braam(37.6, 3.6, 38, 0.6)
	choir(37.6, 3.6, [50, 54, 57, 62, 66, 69], 0.16, 0.15, 1.2)
	pad(37.6, 3.4, [38, 50, 54, 57, 62], 0.3, 1200.0, 0.1, 1.2)
	ney([[38.5, 0.35, 73], [38.85, 2.2, 74]], 0.18)
	bells(38.0, [86, 81, 78, 74], 0.28, 0.06)


static func _master() -> AudioStreamWAV:
	var n := L.size()
	# Hard silence for the pre-title beat, then a fade-out to the end.
	var gap0 := int(37.3 * RATE)
	var gap1 := int(37.58 * RATE)
	var peak := 0.0
	for i in n:
		var tt := float(i) / RATE
		var g := 1.0
		if i >= gap0 and i < gap1:
			g = maxf(1.0 - float(i - gap0) / (0.03 * RATE), 0.0)
		if tt > FINISHER_STRIKE - 0.22 and tt < FINISHER_STRIKE:
			g *= 0.35
		if tt > 40.8:
			g *= pow(clampf(1.0 - (tt - 40.8) / 1.05, 0.0, 1.0), 1.6)
		if tt < 0.02:
			g *= tt / 0.02
		L[i] = tanh(L[i] * 1.1) * g
		R[i] = tanh(R[i] * 1.1) * g
		peak = maxf(peak, maxf(absf(L[i]), absf(R[i])))
	var norm := 0.9 / maxf(peak, 0.0001)
	var bytes := PackedByteArray()
	bytes.resize(n * 4)
	for i in n:
		bytes.encode_s16(i * 4, int(clampf(L[i] * norm, -1.0, 1.0) * 32000.0))
		bytes.encode_s16(i * 4 + 2, int(clampf(R[i] * norm, -1.0, 1.0) * 32000.0))
	var s := AudioStreamWAV.new()
	s.format = AudioStreamWAV.FORMAT_16_BITS
	s.mix_rate = RATE
	s.stereo = true
	s.data = bytes
	return s

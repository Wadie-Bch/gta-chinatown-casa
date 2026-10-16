// Paved stone arena with an inlaid eight-pointed star medallion and a zigzag frieze.
// The geometric motifs are fictional, Amazigh-inspired design elements.
shader_type spatial;

#include "res://shaders/common_noise.gdshaderinc"

uniform vec3 stone_light : source_color = vec3(0.80, 0.62, 0.45);
uniform vec3 stone_dark : source_color = vec3(0.58, 0.42, 0.30);
uniform vec3 grout : source_color = vec3(0.28, 0.19, 0.14);
uniform vec3 terracotta : source_color = vec3(0.68, 0.27, 0.15);
uniform vec3 indigo : source_color = vec3(0.10, 0.17, 0.44);
uniform vec3 bronze : source_color = vec3(0.88, 0.62, 0.28);
uniform float arena_radius = 14.5;

varying vec3 wpos;
varying vec3 wnorm;

void vertex() {
	wpos = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
	wnorm = normalize((MODEL_MATRIX * vec4(NORMAL, 0.0)).xyz);
}

void fragment() {
	vec2 p = wpos.xz;
	float r = length(p);
	float u01 = atan(p.y, p.x) / TAU + 0.5;
	float n = fbm(p * 1.7);
	float rough = 0.92;

	// Concentric courses of paving stones.
	float course_w = 1.25;
	float ci = floor(r / course_w);
	float fr = fract(r / course_w);
	float circ = TAU * max(r, 0.5);
	float segs = max(6.0, floor(circ / 1.6));
	float su = u01 * segs + hash21(vec2(ci, 3.0)) * 0.5;
	float si = floor(su);
	float fa = fract(su);
	float edge = min(min(fr, 1.0 - fr) * course_w, min(fa, 1.0 - fa) * circ / segs);
	float tile_h = hash21(vec2(ci, si));
	vec3 stone = mix(stone_dark, stone_light, 0.3 + 0.7 * tile_h) * (0.82 + 0.3 * n);
	vec3 col = mix(grout, stone, smoothstep(0.025, 0.05, edge));
	col *= mix(0.86, 1.0, smoothstep(0.05, 0.18, edge));

	// Central medallion: eight-pointed star built from two squares.
	vec2 q = p;
	float sq1 = max(abs(q.x), abs(q.y));
	vec2 qr = vec2(q.x - q.y, q.x + q.y) * 0.70710678;
	float sq2 = max(abs(qr.x), abs(qr.y));
	float star = min(sq1, sq2);
	float disc = 1.0 - smoothstep(4.0, 4.05, r);
	vec3 med = indigo * (0.85 + 0.25 * n);
	float s_in = 1.0 - smoothstep(2.22, 2.27, star);
	float s_band = (1.0 - smoothstep(2.6, 2.65, star)) * smoothstep(2.22, 2.27, star);
	med = mix(med, terracotta * (0.9 + 0.2 * n), s_in);
	med = mix(med, bronze, s_band);
	float loz = abs(q.x) + abs(q.y);
	float l_band = (1.0 - smoothstep(1.3, 1.35, loz)) * smoothstep(1.05, 1.1, loz);
	med = mix(med, bronze, l_band);
	med = mix(med, indigo * 1.25, 1.0 - smoothstep(1.05, 1.1, loz));
	float ring = smoothstep(3.55, 3.6, r) * (1.0 - smoothstep(3.78, 3.83, r));
	med = mix(med, bronze, ring);
	col = mix(col, med, disc);
	rough = mix(rough, 0.45, disc * clamp(s_band + l_band + ring, 0.0, 1.0));

	// Zigzag frieze ring.
	float r0 = 9.0;
	float r1 = 10.2;
	float v = (r - r0) / (r1 - r0);
	float inside = step(0.0, v) * step(v, 1.0);
	float arc = u01 * TAU * (r0 + r1) * 0.5;
	float tri = abs(fract(arc / 1.15) - 0.5) * 2.0;
	vec3 band = mix(indigo, terracotta, smoothstep(v - 0.03, v + 0.03, tri));
	float rim = step(v, 0.08) + step(0.92, v);
	band = mix(band, bronze, clamp(rim, 0.0, 1.0));
	col = mix(col, band * (0.85 + 0.25 * n), inside);
	rough = mix(rough, 0.55, inside * clamp(rim, 0.0, 1.0));

	// Darker outer kerb course.
	float border = smoothstep(arena_radius - 0.9, arena_radius - 0.85, r);
	col = mix(col, stone_dark * 0.7 * (0.85 + 0.3 * n), border);

	// Wind-blown sand.
	float dust = smoothstep(0.55, 0.85, fbm(p * 0.35 + 7.0));
	col = mix(col, vec3(0.82, 0.64, 0.46), dust * 0.4);

	// Vertical sides of the platform.
	float side = 1.0 - smoothstep(0.5, 0.8, wnorm.y);
	col = mix(col, stone_dark * 0.7 * (0.8 + 0.4 * n), side);

	ALBEDO = col;
	ROUGHNESS = rough;
	SPECULAR = 0.35;
}

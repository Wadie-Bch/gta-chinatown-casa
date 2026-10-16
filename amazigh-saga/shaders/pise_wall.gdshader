// Rammed-earth (pise) walls and towers with carved triangle friezes.
shader_type spatial;

#include "res://shaders/common_noise.gdshaderinc"

uniform vec3 base_col : source_color = vec3(0.72, 0.42, 0.26);
uniform vec3 dark_col : source_color = vec3(0.50, 0.27, 0.17);
uniform vec3 motif_col : source_color = vec3(0.30, 0.15, 0.10);
uniform float frieze_y = 6.0;
uniform float frieze_h = 0.9;

varying vec3 wpos;
varying vec3 wn;

void vertex() {
	wpos = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
	wn = normalize((MODEL_MATRIX * vec4(NORMAL, 0.0)).xyz);
}

void fragment() {
	float along = abs(wn.x) > abs(wn.z) ? wpos.z : wpos.x;
	float n = fbm(vec2(along, wpos.y) * vec2(0.9, 2.4));
	vec3 col = mix(base_col, dark_col, n * 0.7);
	float layer = abs(fract(wpos.y / 0.55) - 0.5);
	col *= 1.0 - smoothstep(0.43, 0.49, layer) * 0.22;
	float fy = (wpos.y - frieze_y) / frieze_h;
	if (fy > 0.0 && fy < 1.0) {
		float tri = abs(fract(along / 0.7) - 0.5) * 2.0;
		float carve = step(fy, tri) * step(tri - 0.25, fy);
		col = mix(col, motif_col, carve * 0.85);
	}
	col = mix(col, base_col * 1.12, smoothstep(0.7, 0.95, wn.y));
	ALBEDO = col;
	ROUGHNESS = 0.96;
}

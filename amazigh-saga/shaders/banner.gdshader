// Woven banner with zigzag rows and lozenges, swaying in the wind.
shader_type spatial;
render_mode cull_disabled;

uniform vec3 base : source_color = vec3(0.07, 0.13, 0.38);
uniform vec3 accent : source_color = vec3(0.74, 0.28, 0.14);
uniform vec3 gold : source_color = vec3(0.94, 0.72, 0.32);
uniform float phase = 0.0;

void vertex() {
	float h = UV.y;
	VERTEX.z += sin(TIME * 2.1 + phase + h * 3.0) * 0.14 * h;
	VERTEX.x += sin(TIME * 1.3 + phase + h * 2.0) * 0.05 * h;
}

void fragment() {
	vec2 uv = UV;
	vec3 col = base;
	float y = uv.y * 7.0;
	float row = floor(y);
	float fy = fract(y);
	float tri = abs(fract(uv.x * 4.0) - 0.5) * 2.0;
	if (mod(row, 2.0) == 1.0) {
		col = mix(col, accent, step(fy, tri));
	}
	float lz = abs(fract(uv.x * 2.0) - 0.5) * 2.0 + abs(fy - 0.5) * 2.0;
	if (mod(row, 4.0) == 0.0) {
		col = mix(col, gold, step(lz, 0.65) * step(0.35, lz));
	}
	col = mix(col, gold, clamp(step(uv.x, 0.06) + step(0.94, uv.x), 0.0, 1.0));
	float teeth = abs(fract(uv.x * 9.0) - 0.5) * 2.0;
	if (uv.y > 0.92 + teeth * 0.08) {
		discard;
	}
	ALBEDO = col;
	ROUGHNESS = 0.95;
}

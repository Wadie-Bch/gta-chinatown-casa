// Painted shield face: indigo field, terracotta triangle ring, bronze inlays.
shader_type spatial;

uniform vec3 field : source_color = vec3(0.08, 0.14, 0.40);
uniform vec3 accent : source_color = vec3(0.74, 0.29, 0.15);
uniform vec3 metal : source_color = vec3(0.86, 0.60, 0.28);
uniform float radius = 0.36;

varying vec3 lp;

void vertex() {
	lp = VERTEX;
}

float lozenge(vec2 p, vec2 c) {
	vec2 d = abs(p - c);
	return d.x * 1.0 + d.y * 0.55;
}

void fragment() {
	vec2 p = lp.xz / radius;
	float r = length(p);
	float a = atan(p.y, p.x);
	vec3 col = field;
	float m = 0.0;
	float v = (r - 0.62) / 0.24;
	if (v > 0.0 && v < 1.0) {
		float tri = abs(fract(a / TAU * 14.0) - 0.5) * 2.0;
		col = mix(col, accent, step(v, tri));
	}
	float lz = min(min(lozenge(p, vec2(0.36, 0.0)), lozenge(p, vec2(-0.36, 0.0))),
			min(lozenge(p.yx, vec2(0.36, 0.0)), lozenge(p.yx, vec2(-0.36, 0.0))));
	col = mix(col, accent, step(lz, 0.14));
	m = max(m, step(lz, 0.14) * step(0.09, lz));
	m = max(m, step(r, 0.17));
	m = max(m, step(abs(r - 0.6), 0.025));
	m = max(m, step(abs(r - 0.885), 0.03));
	col = mix(col, metal, m);
	ALBEDO = col;
	METALLIC = m * 0.85;
	ROUGHNESS = mix(0.75, 0.35, m);
}

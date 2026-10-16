// The harbinger ("the last star"): a black alien body with a burning rim and
// geometric seams of cosmic light. Unshaded and unfogged so it reads at distance.
shader_type spatial;
render_mode unshaded, fog_disabled, shadows_disabled;

#include "res://shaders/common_noise.gdshaderinc"

uniform vec3 body : source_color = vec3(0.025, 0.015, 0.045);
uniform vec3 rim_a : source_color = vec3(0.35, 1.0, 0.95);
uniform vec3 rim_b : source_color = vec3(0.75, 0.35, 1.0);
uniform float rim_power = 3.0;
uniform float seam_glow = 1.0;
uniform float intensity = 1.0;

varying vec3 lp;

void vertex() {
	lp = VERTEX;
}

void fragment() {
	float fres = pow(1.0 - clamp(dot(NORMAL, VIEW), 0.0, 1.0), rim_power);
	vec3 n = normalize(lp);
	float lon = atan(n.z, n.x);
	float lat = asin(clamp(n.y, -1.0, 1.0));
	// Interlocking diagonal seams: an alien lattice, not a human motif.
	float a = abs(fract((lon * 3.0 + lat * 4.0) / 3.14159) - 0.5);
	float b = abs(fract((lon * 3.0 - lat * 4.0) / 3.14159) - 0.5);
	float seam = smoothstep(0.03, 0.0, min(a, b));
	float pulse = 0.6 + 0.4 * sin(TIME * 1.7 + lat * 6.0);
	float n2 = fbm(vec2(lon * 3.0, lat * 3.0 + TIME * 0.05));
	vec3 rim = mix(rim_b, rim_a, n2);
	vec3 col = body + rim * fres * 2.2 + rim_a * seam * pulse * seam_glow * 0.9;
	ALBEDO = col * intensity;
}

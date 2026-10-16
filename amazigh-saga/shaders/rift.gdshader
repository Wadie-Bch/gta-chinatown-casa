// The star rift: a glowing tear in the sky the creature came through.
shader_type spatial;
render_mode unshaded, blend_add, cull_disabled, depth_draw_never, fog_disabled, shadows_disabled;

#include "res://shaders/common_noise.gdshaderinc"

uniform vec3 col_a : source_color = vec3(0.25, 1.0, 0.9);
uniform vec3 col_b : source_color = vec3(0.72, 0.30, 1.0);
uniform float intensity = 1.0;

void fragment() {
	vec2 p = UV * 2.0 - 1.0;
	float t = TIME;
	float w = 0.13 * (1.0 - p.x * p.x) + 0.015;
	float wav = sin(p.x * 6.0 + t * 0.6) * 0.06 + (fbm(vec2(p.x * 3.0, t * 0.15)) - 0.5) * 0.16;
	float d = abs(p.y - wav);
	float core = exp(-d * d / (w * w * 0.08));
	float glow = exp(-d * d / (w * w * 3.0)) * (1.0 - abs(p.x));
	float swirl = fbm(vec2(p.x * 5.0 + t * 0.25, p.y * 7.0 - t * 0.2));
	vec3 c = mix(col_b, col_a, swirl) * glow * 1.5 + vec3(0.95, 0.95, 1.0) * core * 1.4;
	float edge = smoothstep(1.0, 0.65, abs(p.x));
	ALBEDO = c * edge * intensity;
}

// Corona and light rays around the harbinger.
shader_type spatial;
render_mode unshaded, blend_add, cull_disabled, depth_draw_never, fog_disabled, shadows_disabled;

#include "res://shaders/common_noise.gdshaderinc"

uniform vec3 col_a : source_color = vec3(0.3, 1.0, 0.95);
uniform vec3 col_b : source_color = vec3(0.7, 0.3, 1.0);
uniform float inner = 0.36;
uniform float intensity = 1.0;

void fragment() {
	vec2 p = UV * 2.0 - 1.0;
	float r = length(p);
	float ang = atan(p.y, p.x);
	float rays = fbm(vec2(ang * 4.0, TIME * 0.12)) * 0.6 + fbm(vec2(ang * 11.0, TIME * 0.2)) * 0.4;
	float ring = exp(-pow((r - inner) / 0.035, 2.0));
	float halo = exp(-max(r - inner, 0.0) * (5.0 - 2.5 * rays)) * step(inner * 0.92, r);
	float fade = smoothstep(1.0, 0.7, r);
	vec3 c = mix(col_b, col_a, rays) * (halo * 0.9 + ring * 1.6) * fade;
	ALBEDO = c * intensity;
}

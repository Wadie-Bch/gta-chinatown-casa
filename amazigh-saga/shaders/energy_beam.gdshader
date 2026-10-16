// Vertical beam of starlight used when the creature descends.
shader_type spatial;
render_mode unshaded, blend_add, cull_disabled, depth_draw_never, shadows_disabled;

uniform vec3 color : source_color = vec3(0.4, 0.95, 1.0);
uniform float intensity = 1.0;

void fragment() {
	float edge = 1.0 - abs(dot(NORMAL, VIEW));
	float core = pow(1.0 - edge, 3.0);
	float flick = 0.85 + 0.15 * sin(TIME * 40.0 + UV.y * 30.0);
	ALBEDO = color * (core * 1.6 + 0.25) * flick * intensity;
}

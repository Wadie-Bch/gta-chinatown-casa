// Full-screen trailer grade: saturation, tint, vignette, fade and a flicker for memories.
shader_type canvas_item;

uniform sampler2D screen_tex : hint_screen_texture, filter_linear;
uniform float saturation = 1.0;
uniform float contrast = 1.0;
uniform vec3 tint = vec3(1.0);
uniform float tint_mix = 0.0;
uniform float vignette = 0.35;
uniform float fade = 0.0;
uniform vec3 fade_color = vec3(0.0);
uniform float flicker = 0.0;
uniform float frame = 0.0;

float h11(float x) { return fract(sin(x * 91.17) * 43758.55); }

void fragment() {
	vec3 c = texture(screen_tex, SCREEN_UV).rgb;
	float l = dot(c, vec3(0.299, 0.587, 0.114));
	c = mix(vec3(l), c, saturation);
	c = (c - 0.5) * contrast + 0.5;
	c = mix(c, vec3(l) * tint * 1.25, tint_mix);
	c *= 1.0 - flicker * (0.15 + 0.15 * h11(frame));
	vec2 d = SCREEN_UV - 0.5;
	d.x *= 0.75;
	c *= 1.0 - vignette * smoothstep(0.2, 0.75, length(d));
	c = mix(c, fade_color, fade);
	COLOR = vec4(c, 1.0);
}

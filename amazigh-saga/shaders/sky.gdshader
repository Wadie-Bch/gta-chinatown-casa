// Dusk over the Atlas: warm horizon, deep-blue zenith, early stars and a faint glow
// where the star rift tears the sky. Static (no TIME) so the radiance map stays cheap.
shader_type sky;

uniform vec3 zenith : source_color = vec3(0.04, 0.06, 0.19);
uniform vec3 upper : source_color = vec3(0.15, 0.20, 0.46);
uniform vec3 horizon : source_color = vec3(0.98, 0.55, 0.30);
uniform vec3 haze : source_color = vec3(0.98, 0.74, 0.50);
uniform vec3 ground : source_color = vec3(0.26, 0.15, 0.10);
uniform vec3 rift_dir = vec3(0.0, 0.42, -0.91);
uniform vec3 rift_col : source_color = vec3(0.45, 0.35, 1.0);
// Trailer controls (defaults leave the game's sky unchanged).
uniform float darkness = 0.0;
uniform float star_fade = 0.0;
uniform float sunset = 0.0;
uniform vec3 omen_tint : source_color = vec3(0.16, 0.08, 0.24);

float hash3(vec3 p) {
	p = fract(p * 0.3183099 + 0.1);
	p *= 17.0;
	return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

void sky() {
	vec3 d = EYEDIR;
	float h = d.y;
	vec3 col;
	if (h >= 0.0) {
		float t = pow(h, 0.5);
		col = mix(haze, horizon, smoothstep(0.0, 0.08, t));
		col = mix(col, upper, smoothstep(0.08, 0.55, t));
		col = mix(col, zenith, smoothstep(0.55, 1.0, t));
		vec3 warm = mix(vec3(1.0, 0.5, 0.3), vec3(0.6, 0.28, 0.42), smoothstep(0.05, 0.55, t));
		col = mix(col, warm, sunset * (1.0 - smoothstep(0.0, 0.8, t)) * 0.85);
		float sd = max(dot(d, LIGHT0_DIRECTION), 0.0);
		col += vec3(1.0, 0.55, 0.25) * pow(sd, 6.0) * 0.55 * (1.0 - t);
		col += vec3(1.0, 0.86, 0.62) * smoothstep(0.9990, 0.9996, sd) * 3.0;
		// Stars, fading in with altitude.
		vec3 sp = d * 260.0;
		vec3 cell = floor(sp);
		float r = hash3(cell);
		float star = step(0.986, r) * smoothstep(0.42, 0.0, length(fract(sp) - 0.5));
		star *= step(star_fade, hash3(cell + 31.0));
		col += vec3(0.85, 0.92, 1.0) * star * smoothstep(0.18, 0.65, h) * (0.6 + 1.4 * hash3(cell + 7.0));
		// Glow around the rift.
		float rd = max(dot(d, normalize(rift_dir)), 0.0);
		col += rift_col * pow(rd, 24.0) * 0.55;
	} else {
		col = mix(haze * 0.85, ground, smoothstep(0.0, 0.2, -h));
	}
	vec3 omen = mix(omen_tint, omen_tint * 0.35, smoothstep(-0.1, 0.6, h));
	col = mix(col, omen + col * 0.12, darkness);
	COLOR = col;
}

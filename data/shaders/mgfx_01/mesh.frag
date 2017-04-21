#version 440

#extension GL_ARB_separate_shader_objects : enable
#extension GL_ARB_shading_language_420pack : enable

layout (location = 0) in vec3 inNormal;
layout (location = 1) in vec3 inColor;
layout (location = 2) in vec3 inViewVec;
layout (location = 3) in vec3 inLightVec;
layout (location = 4) in vec4 inMaterial;

layout (location = 0) out vec4 outFragColor;

struct Light {
 	vec3 pos;
    vec3 color;
};

float G1V ( float dotNV, float k ) {
	return 1.0 / (dotNV*(1.0 - k) + k);
}

vec3 computePBRLighting ( in Light light, in vec3 position, in vec3 N, in vec3 V, in vec3 albedo, in float roughness, in vec3 F0 ) {

	float alpha = roughness*roughness;
	vec3 L = normalize(light.pos.xyz - position);
	vec3 H = normalize (V + L);

	float dotNL = clamp (dot (N, L), 0.0, 1.0);
	float dotNV = clamp (dot (N, V), 0.0, 1.0);
	float dotNH = clamp (dot (N, H), 0.0, 1.0);
	float dotLH = clamp (dot (L, H), 0.0, 1.0);
	float dotVH = clamp (dot (V, H), 0.0, 1.0);

	float D, vis;
	vec3 F;

	// NDF : GGX
	float alphaSqr = alpha*alpha;
	float pi = 3.1415926535;

	// NoH2 * alpha2 + (1 - NoH2);
	float denom = dotNH * dotNH * (alphaSqr - 1.0) + 1.0;
	D = alphaSqr / (pi * denom * denom + 0.00001);

	// Fresnel (Schlick)
	F = F0 + (1.0 - F0)*(pow (1.0 - dotLH, 5.0));

	// Visibility term (G) : Smith with Schlick's approximation
	float k = alpha / 2.0;
	vis = G1V (dotNL, k) * G1V (dotNV, k);

	vec3 specular = /*dotNL **/ D * F * vis;

	float invPi = 0.31830988618;
	vec3 diffuse = (albedo * invPi);

	vec3 kD = (1 - F);

	return (diffuse * kD + specular) * light.color.xyz * dotNL;
}


void main() 
{
	vec3 N = normalize(inNormal);
	vec3 V = normalize(inViewVec);
	vec3 P = -inViewVec;
	vec3 ambient = vec3(0.1);
	
	Light light;
	light.pos = inLightVec;
	light.color = vec3(1.0, 1.0, 1.0) * 2.0;

	float roughness = smoothstep(0.4, 0.6, abs(sin(inMaterial.y * 2.5)));
	float metallic = smoothstep(0.0, 0.1, inMaterial.x);

	roughness = clamp(roughness, 0.1, 0.9);
	metallic = clamp(metallic, 0.1, 0.9);

	vec3 albedo = vec3(1.0, 0.880, 0.605);
	vec3 f0 = albedo * albedo * (1 - metallic) + vec3(0.04) * metallic;
	f0 = clamp(f0, vec3(0.0), vec3(1.0));

	vec3 pbr = computePBRLighting(light, P, N, V, albedo, roughness, f0);

	outFragColor = vec4((ambient + pbr) * inColor, 1.0);
}
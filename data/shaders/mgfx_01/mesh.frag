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

#define PI 3.1415926535
#define INV_PI 0.31830988618

float DistributionGGX(vec3 N, vec3 H, float roughness)
{
    float a      = roughness*roughness;
    float a2     = a*a;
    float NdotH  = max(dot(N, H), 0.0);
    float NdotH2 = NdotH*NdotH;
	
    float nom   = a2;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;
	
    return nom / denom;
}

float GeometrySchlickGGX(float NdotV, float roughness)
{
    float r = (roughness + 1.0);
    float k = (r*r) / 8.0;

    float nom   = NdotV;
    float denom = NdotV * (1.0 - k) + k;
	
    return nom / denom;
}

float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness)
{
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx2  = GeometrySchlickGGX(NdotV, roughness);
    float ggx1  = GeometrySchlickGGX(NdotL, roughness);
	
    return ggx1 * ggx2;
}

vec3 fresnelSchlick(float cosTheta, vec3 F0)
{
    return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}

vec3 computePBRLighting ( in Light light, in vec3 position, in vec3 N, in vec3 V, in vec3 albedo, in float roughness, in float metallic, in vec3 F0 ) {

	vec3 L = normalize(light.pos.xyz - position);
	vec3 H = normalize (V + L);
	
	float NDF = DistributionGGX(N, H, roughness);        
	float G   = GeometrySmith(N, V, L, roughness);      
	vec3 F    = fresnelSchlick(max(dot(H, V), 0.0), F0);       

	vec3 kS = F;
	vec3 kD = vec3(1.0) - kS;
	kD *= 1.0 - metallic;	  

	vec3 nominator    = NDF * G * F;
	float denominator = 4 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.001; 
	vec3 specular     = nominator / denominator;

	vec3 radiance = light.color;

	// add to outgoing radiance Lo
	float NdotL = max(dot(N, L), 0.0);                
	return (kD * albedo / PI + specular) * radiance * NdotL; 
}


void main() 
{
	vec3 N = normalize(inNormal);
	vec3 V = normalize(inViewVec);
	vec3 P = -inViewVec;
	vec3 ambient = vec3(0.1);
	
	Light light;
	light.pos = inLightVec;
	light.color = vec3(1.0, 1.0, 1.0);

	float roughness = smoothstep(0.4, 0.6, abs(sin(inMaterial.x * 5))) + 0.1;
	float f0 = smoothstep(0.0, 0.1, inMaterial.y) * 0.875 + 0.125;

	roughness = clamp(roughness, 0.0, 1.0);
	f0 = clamp(f0, 0.0, 1.0);

	vec3 pbr = computePBRLighting(light, P, N, V, vec3(1.0, 0.25, 0.25), roughness, 0.0, vec3(f0));

	outFragColor = vec4((ambient + pbr) * inColor, 1.0);
}
#version 440

#extension GL_ARB_separate_shader_objects : enable
#extension GL_ARB_shading_language_420pack : enable

layout (location = 0) in vec4 inPos;
layout (location = 1) in vec3 inNormal;
layout (location = 2) in vec3 inColor;

layout (set = 0, binding = 0) uniform UBO 
{
	mat4 projection;
	mat4 model;
} ubo;

layout (location = 0) out vec3 outNormal;
layout (location = 1) out vec3 outColor;
layout (location = 2) out vec3 outViewVec;
layout (location = 3) out vec3 outLightVec;
layout (location = 4) out vec4 outMaterial;

out gl_PerVertex
{
	vec4 gl_Position;
};

void main() 
{
	outNormal = inNormal;
	outColor = inColor;
	gl_Position = ubo.projection * ubo.model * inPos;

	vec4 pos = ubo.model * vec4(inPos.xyz, 1.0);
	outNormal = mat3(ubo.model) * inNormal;

	vec3 lightPos = vec3(1.0f, -1.0f, 1.0f);
	outLightVec = lightPos.xyz;
	outViewVec = -pos.xyz;

	outMaterial.rgb = vec3(0.25);
	outMaterial.a =  step(0.5, sin(inPos.x * 5) * 0.5 + 0.5);
}

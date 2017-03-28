#version 440

#extension GL_ARB_shading_language_include : enable
#extension GL_ARB_separate_shader_objects : enable
#extension GL_ARB_shading_language_420pack : enable

layout (triangles) in;
layout (triangle_strip, max_vertices = 18) out;

layout (binding = 1) uniform UBO 
{
	mat4 projection;
	mat4 model;
} ubo;

layout (location = 0) in vec3 inNormal[];

layout (location = 0) out vec3 outColor;

void orthoNormalize(inout vec3 n, inout vec3 t)
{
	n = normalize(n);
	t = t - (n * dot(t, n));
	t = normalize(t);
}

void main(void)
{	
	float w = 0.01;
	float h = 0.1;

	for(int i=0; i<gl_in.length(); i++)
	{
		vec3 pos = (ubo.model * gl_in[i].gl_Position).xyz;
		vec3 normal = (mat3(ubo.model) * inNormal[i]).xyz;
		vec3 swizzled = normal.yzx;
		vec3 tangent = cross(normal, swizzled);

		orthoNormalize(normal, tangent);

		vec3 p0 = pos + tangent * w;
		vec3 p1 = pos - tangent * w;
		vec3 p2 = pos + tangent * w + normal * h;
		vec3 p3 = pos - tangent * w + normal * h;

		outColor = vec3(1.0, 0.0, 0.0);

		gl_Position = ubo.projection * vec4(p0, 1.0);
		EmitVertex();

		gl_Position = ubo.projection * vec4(p1, 1.0);
		EmitVertex();

		gl_Position = ubo.projection * vec4(p2, 1.0);
		EmitVertex();

		EndPrimitive();

		outColor = vec3(0.0, 1.0, 0.0);

		gl_Position = ubo.projection * vec4(p3, 1.0);
		EmitVertex();

		gl_Position = ubo.projection * vec4(p2, 1.0);
		EmitVertex();

		gl_Position = ubo.projection * vec4(p1, 1.0);
		EmitVertex();

		EndPrimitive();
	}
}
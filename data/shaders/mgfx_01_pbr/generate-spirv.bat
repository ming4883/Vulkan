@set PATH=%PATH%;..\..\..\bin
@cls
glslangvalidator -V mesh.vert -o mesh.vert.spv
glslangvalidator -V mesh.ggx.frag -o mesh.ggx.frag.spv

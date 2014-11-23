precision mediump float;

attribute vec3 position;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform vec3 characterPos;
uniform float unitsPerEm;

void main() {

  vec3 pos = position + characterPos;

  gl_Position = projection * view * model * vec4(pos / unitsPerEm, 1.0);

  // gl_Position = vec4(
  //   ((position / 1000.0) - vec3(1.0, 0.0, 0.0)) + characterPos,
  //   1.0
  // );
}

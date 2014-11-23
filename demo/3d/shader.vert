precision mediump float;

attribute vec3 position;
attribute vec3 normal;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform vec3 characterPos;
uniform float unitsPerEm;
uniform float time;

varying vec3 faceNormal;

void main() {

  vec3 pos = position + characterPos;
  faceNormal = normalize(normal + 1.0);

  pos.y += sin((pos.x + time/10.0) / 100.0) * 50.0;
  pos.x += sin((pos.y + time)/100.0) * 10.0;// + cos(pos.x * time) * 10.0;


  gl_Position = projection * view * model * vec4(pos / unitsPerEm, 1.0);

  // gl_Position = vec4(
  //   ((position / 1000.0) - vec3(1.0, 0.0, 0.0)) + characterPos,
  //   1.0
  // );
}

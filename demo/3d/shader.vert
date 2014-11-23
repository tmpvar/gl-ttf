precision mediump float;

attribute vec3 position;

uniform vec3 characterPos;

void main() {
  gl_Position = vec4(
    ((position / 1000.0) - vec3(1.0, 0.0, 0.0)) + characterPos,
    1.0
  );
}

precision mediump float;

varying vec3 faceNormal;

void main() {
  gl_FragColor = vec4(faceNormal, 1.0);
}

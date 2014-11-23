var createWebGLContext = require('fc');
var createGeometry = require('gl-geometry');
var createFont = require('../gl-ttf');
var createGLClear = require('gl-clear');
var glslify       = require('glslify')

var gl = createWebGLContext(render, true, 3);
var clear = createGLClear({
  color: [0.043, 0.043, .086, 1.0]
}).bind(null, gl);

var shader = glslify({
  vert: './3d/shader.vert',
  frag: './3d/shader.frag'
})(gl);
console.log(shader);

createFont('node_modules/opentype/test/fonts/sourcesanspro-regular.ttf', fontCreated);

var letters = [];


var characterPos = [0, 0, 0];

function render() {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  clear();

  characterPos = [0, 0, 0];

  letters.forEach(function(letter) {
    console.log('render letter');
    letter.geometry.bind(shader);
    shader.uniforms.characterPos = characterPos;
    letter.geometry.draw(gl.TRIANGLES);
    letter.geometry.bind(shader);

    characterPos[0] += letter.glyph.advanceWidth / 1000;

  });
  letters.length && gl.stop();
}

function fontCreated(e, buildCharacter) {
  if (e) {
    throw e;
  }

  'hello'.split('').forEach(function(c) {
    var character = buildCharacter(c);

    var triangles = character.triangles;
    character.geometry = createGeometry(gl)
      .attr('positions', triangles.positions)
      .attr('normals', triangles.normals)
      .faces(triangles.cells);

    letters.push(character);
  });
}

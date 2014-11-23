var createWebGLContext = require('fc');
var glslify            = require('glslify')
var createGLClear      = require('gl-clear');
var createGeometry     = require('gl-geometry');
var createCamera       = require('orbit-camera');
var mat4               = require('gl-matrix-mat4');

var createFont         = require('../gl-ttf');


var m4scratch = mat4.create();

var camera = createCamera(
  [0, 10, 20],
  [0, 0, 0],
  [0, 1, 0]
);

var gl = createWebGLContext(render, true, 3);
var clear = createGLClear({
  color: [0.043, 0.043, .086, 1.0]
}).bind(null, gl);

var shader = glslify({
  vert: './3d/shader.vert',
  frag: './3d/shader.frag'
})(gl);

createFont('node_modules/opentype/test/fonts/sourcesanspro-regular.ttf', fontCreated);

var letters = [];

var characterPos = [0, 0, 0];
var unitsPerEm = 2048;

function render() {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  clear();

  characterPos = [0, 0, 0];
  shader.bind();

  shader.uniforms.unitsPerEm = unitsPerEm;
  shader.uniforms.model = mat4.identity(m4scratch);
  shader.uniforms.projection = mat4.perspective(
    m4scratch,
    Math.PI/4,
    gl.canvas.width/gl.canvas.height,
    0.1,
    1000.00
  );

  shader.uniforms.view = camera.view(m4scratch);

  letters.forEach(function(letter) {
    letter.geometry.bind(shader);
    shader.uniforms.characterPos = characterPos;
    letter.geometry.draw(gl.TRIANGLES);
    letter.geometry.bind(shader);

    characterPos[0] += letter.glyph.advanceWidth;

  });
}

function fontCreated(e, buildCharacter, font) {
  if (e) {
    throw e;
  }

  unitsPerEm = font.unitsPerEm;

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

var mouse = {
  down: false,
  pos: [0, 0]
};

function handleMouse(e) {
  switch (e.type) {
    case 'mousedown':
      mouse.down=true;
    break;

    case 'mouseup':
      mouse.down = false;
    break;

    case 'mousemove':
      var x = e.clientX;
      var y = e.clientY;

      if (mouse.down) {
        // fc ensures that the canvas is fullscreen
        // you'll want to get the offset of the canvas
        // element if you don't use fc.

        var w = gl.canvas.width;
        var h = gl.canvas.height;
        var l = mouse.pos;
        camera.rotate(
          [x/w - .5, y/h - .5,],
          [l[0]/w - .5, l[1]/h - .5]
        )

      }
      mouse.pos = [x, y];

    break;

    case 'mousewheel':
      camera.zoom(e.wheelDeltaY * -.01);
      e.preventDefault();
    break;

    case 'keydown' :
      var panSpeed = .01;
      switch (e.keyCode) {
        case 37:
          camera.pan([-panSpeed, 0, 0]);
        break;

        case 38:
          camera.pan([0, -panSpeed, 0]);
        break;

        case 39:
          camera.pan([panSpeed, 0, 0]);
        break;

        case 40:
          camera.pan([0, panSpeed, 0]);
        break;
      }
      console.log(e.keyCode)
    break;


    default:
      console.log(e);
  }

}

['mousedown', 'mouseup', 'mousemove', 'mousewheel', 'keydown'].forEach(function(name) {
  document.addEventListener(name, handleMouse);
});

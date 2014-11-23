var createWebGLContext = require('fc');
var glslify            = require('glslify')
var createGLClear      = require('gl-clear');
var createGeometry     = require('gl-geometry');
var createCamera       = require('orbit-camera');
var computeNormal      = require('triangle-normal');
var mat4               = require('gl-matrix-mat4');

var createFont         = require('../gl-ttf');


var m4scratch = mat4.create();

var camera = createCamera(
  [10, 0, 2],
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
var start = Date.now();
function render() {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.enable(gl.DEPTH_TEST);
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
  var now = Date.now();

  letters.forEach(function(letter) {
    letter.geometry.bind(shader);
    shader.uniforms.characterPos = characterPos;
    shader.uniforms.time = now - start;
    letter.geometry.draw(gl.TRIANGLES);
    letter.geometry.bind(shader);

    characterPos[0] += letter.glyph.advanceWidth;
  });
}

function unique(array) {
  var seen = {};
  return array.filter(function(point) {
    var key = point.join(',');
    if (seen[key]) {
      return false;
    }
    seen[key] = true;
    return true;
  });
}

function extrude(polygon, amount, sc) {
  polygon = unique(polygon);
  sc = sc || {
    cells : [],
    positions: [],
    normals: []
  };

  var cells = sc.cells;
  var positions = sc.positions;
  var normals = sc.normals;
  var polygonLength = polygon.length;
  var i;

  var cellStart = cells.length-1;
  var start = positions.length;

  for (i=0; i<polygonLength; i++) {
    var n = polygon[i+1] || polygon[0];
    var c = polygon[i];

    // wrap around to the start
    var o = (i<polygonLength-1) ? positions.length : start;
    positions.push(c.concat(0));
    positions.push(c.concat(amount));

    cells.push([o + 0, o + 1, o + 2]);
    cells.push([o + 1, o + 3, o + 2]);
  }

  var end = positions.length - 1;
  cells.push([
    end - 1,
    end,
    start
  ]);

  cells.push([
    end,
    start + 1,
    start
  ]);

  if (!normals) {
    cellStart = 0;
  }

  normals.length = positions.length;
  for (i=cellStart; i<cells.length; i++) {
    var a = cells[i][0];
    var b = cells[i][1];
    var c = cells[i][2];

    var normal = computeNormal(
      positions[a][0], positions[a][1], positions[a][2],
      positions[b][0], positions[b][1], positions[b][2],
      positions[c][0], positions[c][1], positions[c][2]
    );

    normals[a] = normal;
    normals[b] = normal;
    normals[c] = normal;
  }

  return sc;
}

function createOffsetCap(sc, amount) {
  var cells = sc.cells;
  var normals = sc.normals;
  var positions = sc.positions;
  if (cells.length) {
    var cellLength = cells.length
    for (var i=0; i<cellLength; i++) {
      var a = cells[i][0];
      var b = cells[i][1];
      var c = cells[i][2];

      normals.push(normals[a]);
      a = positions.push([
        positions[a][0],
        positions[a][1],
        positions[a][2] + amount,
      ]) - 1;

      normals.push(normals[b]);
      b = positions.push([
        positions[b][0],
        positions[b][1],
        positions[b][2] + amount,
      ]) - 1;


      normals.push(normals[c]);
      c = positions.push([
        positions[c][0],
        positions[c][1],
        positions[c][2] + amount,
      ]) - 1;

      cells.push([a, b, c]);
    }
  }
}


function fontCreated(e, buildCharacter, font) {
  if (e) {
    throw e;
  }

  unitsPerEm = font.unitsPerEm;

  'h∑llø!'.split('').forEach(function(c) {
    var character = buildCharacter(c);
    var triangles = character.triangles;

    var extrudeAmount = unitsPerEm / 10;

    createOffsetCap(triangles, extrudeAmount);

    character.polygons.forEach(function(polygon) {
      extrude(polygon, extrudeAmount, character.triangles);
    });

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
    break;
  }
}

['mousedown', 'mouseup', 'mousemove', 'mousewheel', 'keydown'].forEach(function(name) {
  document.addEventListener(name, handleMouse);
});

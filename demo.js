var opentype = require('./opentype');
var quadratic = require('adaptive-quadratic-curve');
var triangulate = require('triangulate-contours');

var polygons = [];
var segments = [];

var ctx = require('fc')(function() {
  if (!polygons.length) {
    return;
  }

  ctx.clear();

  ctx.fillStyle = "orange";
  ctx.save();
    // ctx.translate(window.innerWidth/2, 0);
    ctx.translate(0, -50);
    ctx.scale(4, 4);
    polygons.forEach(function(polygon, p) {

      var l = polygon.length;

      ctx.beginPath();
      var last = '';
      for (var i=0; i<l; i++) {
        var poly = polygon[i];
        var key = poly && poly.join(',');
        if (key === last) {
          continue;
        }
        last = key;
        if (!poly[2]) {
          ctx.lineTo(poly[0], poly[1]);
        } else {
          ctx.moveTo(poly[0], poly[1]);
        }
      }
      ctx.closePath();
      ctx.strokeStyle = "yellow";
      ctx.lineWidth = .5;
      ctx.stroke();

      for (var i=0; i<l; i++) {
        ctx.beginPath();
          ctx.moveTo(polygon[i][0], polygon[i][1]);
          ctx.arc(polygon[i][0], polygon[i][1], .5, 0, Math.PI*2, false);
        ctx.closePath()
        ctx.lineWidth = .2;
        ctx.strokeStyle = "white"
        ctx.stroke();
      }

    });

    var sc = triangulate(polygons.map(function(a) {
      return a.filter(Boolean).map(function(v) {
        return v.slice(0, 2);
      });
    }));

    var pos = sc.positions;
    sc.cells.forEach(function(cell) {
      ctx.beginPath()
        ctx.moveTo(
          pos[cell[0]][0],
          pos[cell[0]][1]
        );

        ctx.lineTo(
          pos[cell[1]][0],
          pos[cell[1]][1]
        );

        ctx.lineTo(
          pos[cell[2]][0],
          pos[cell[2]][1]
        );
      ctx.closePath();
      ctx.strokeStyle = "purple"
      ctx.stroke();
    });

  ctx.restore();
}, false);



opentype.load('node_modules/opentype/test/fonts/sourcesanspro-regular.ttf', function(e, font) {
  var path = font.getPath('hello world!', 0, 150, 72);
  var commands = path.commands;

  commands.forEach(function(command, i) {
    switch (command.type) {
      case 'M':
        segments.push([command.x, command.y, true]);
        if (segments.length > 1) {
          // segments.push(false);
          polygons.push(segments);
          segments = [];
        }

      break;

      case 'Q':
        Array.prototype.push.apply(segments, quadratic(
          [commands[i-1].x, commands[i-1].y],
          [command.x1, command.y1],
          [command.x, command.y],
          1
        ));

      case 'L':
        segments.push([command.x, command.y]);
      break;

      case 'Z':
        if (segments.length) {
          segments.push(false);
          polygons.push(segments);
          segments = [];
        }
      break;
    }
  });

  if (segments.length) {
    segments.push(false);
    polygons.push(segments);
    segments = [];
  }

  ctx.dirty();
})

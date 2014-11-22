var createFont = require('../gl-ttf');

createFont('node_modules/opentype/test/fonts/sourcesanspro-regular.ttf', function(e, buildCharacter) {
  document.addEventListener('keypress', function(e) {
    var c = buildCharacter(e.which);
    text.splice(cursorChar, 0, c);
    cursorChar++;
  });

  document.addEventListener('keydown', function(e) {
    switch (e.keyCode) {
      case 8:
        if (cursorChar > 0) {
          text.splice(cursorChar-1,1);
          cursorChar--;
          e.preventDefault();
          cursorOn = true;
        }
      break;

      case 37: // left
        if (cursorChar > 0) {
          cursorChar--;
        }
      break;

      case 39:
        if (cursorChar <= text.length) {
          cursorChar++;
        }
      break;
    }
  });
});

var cursor = [0, 50];
var cursorChar = 0;
var cursorOn = false;
var text = [];

setInterval(function() {
  cursorOn = !cursorOn;
}, 500);


function drawCursor(ctx, advance) {
  ctx.beginPath();
    ctx.moveTo(advance, cursor[1] - 100);
    ctx.lineTo(advance, cursor[1] + 750);
    ctx.lineWidth=5;
    ctx.strokeStyle = "red";
    ctx.stroke();
}

var ctx = require('fc')(function() {

  ctx.clear();

  ctx.fillStyle = "orange";
  ctx.save();
    // ctx.translate(window.innerWidth/2, 0);
    ctx.translate(20, 400);
    ctx.scale(.25, -.25);

  if (!text.length && cursorOn) {
    drawCursor(ctx, 0);
  }

  var left = 0;
  text.forEach(function(c, ci) {
    var polygons = c.polygons;

    ctx.save();
    ctx.translate(left, 0);

    if (cursorOn && ci+1 === cursorChar) {
      drawCursor(ctx, c.glyph.advanceWidth);
    }

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
      ctx.lineWidth = 1;
      ctx.stroke();

      for (var i=0; i<l; i++) {
        ctx.beginPath();
          ctx.moveTo(polygon[i][0], polygon[i][1]);
          ctx.arc(polygon[i][0], polygon[i][1], 3, 0, Math.PI*2, false);
        ctx.closePath()
        ctx.lineWidth = 1;
        ctx.strokeStyle = "white"
        ctx.stroke();
      }
    });

    var pos = c.triangles.positions;
    c.triangles.cells.forEach(function(cell) {
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


    left += c.glyph.advanceWidth;
    ctx.restore();

  });
  ctx.restore();
}, true);

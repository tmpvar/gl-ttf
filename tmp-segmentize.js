var quadratic = require('adaptive-quadratic-curve');


module.exports = segmentizePath;

var segmentCache = {};

function segmentizePath(commands) {
  var polygons = [];
  var segments = [];

  commands.forEach(function(command, i) {
    switch (command.type) {
      case 'M':
        if (segments.length > 1) {
          polygons.push(segments);
          segments = [];
        } else {
          segments.push([command.x, command.y]);
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
          polygons.push(segments);
          segments = [];
        }
      break;
    }
  });

  if (segments.length) {
    polygons.push(segments);
    segments = [];
  }

  return polygons;
}

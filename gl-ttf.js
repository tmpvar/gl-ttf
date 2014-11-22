var opentype = require('./opentype');
var triangulate = require('triangulate-contours');
var segmentisePath = require('./tmp-segmentize');
var path = require('path');

module.exports = createFont;

function createFont(path, cb) {

  opentype.load(path, function(e, font) {
    if (e) {
      return cb(e);
    }

    var lookup = window.lookup = {};
    font.glyphs.forEach(function(glyph, i) {
      lookup[glyph.unicode] = glyph;
    });


    var cachedCharacters = {};
    // you can easily get the unicode char code
    // from a keypress event (e.which)
    function buildCharacter(charCode) {
      if (Object.prototype.toString.apply(charCode) === '[object String]') {
        charCode = charCode.charCodeAt(0);
      }

      if (cachedCharacters[charCode]) {
        return cachedCharacters[charCode];
      }

      var glyph = lookup[charCode];
      if (!glyph) {
        return null;
      }

      var polygons = segmentisePath(glyph.path.commands);
      var triangles = triangulate(polygons);

      cachedCharacters[charCode] = {
        polygons: polygons,
        glyph: glyph,
        triangles: triangles
      };

      return cachedCharacters[charCode];
    }

    cb(null, buildCharacter);
  });
}

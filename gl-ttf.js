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
    // you can easily get the charCode
    // from a keypress event (e.which)
    function buildCharacter(charCode) {
      if (cachedCharacters[charCode]) {
        return cachedCharacters[charCode];
      }

      var glyph = lookup[charCode];
      if (!glyph) {
        return null;
      }


      var polygons = segmentisePath(glyph.path.commands);

      // TODO: super unoptimized
      var triangles = triangulate(polygons.map(function(a) {
        return a.filter(Boolean).map(function(v) {
          return v.slice(0, 2);
        });
      }));

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

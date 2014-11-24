# gl-ttf

create meshes from ttf fonts

## install

`npm install gl-ttf`

## use

```javascript

var createFont = require('gl-ttf');

createFont('./path/to/font.ttf', function fontLoaded(e, buildCharacter, font) {
  if (e) {
    throw e;
  {

  var c = buildCharacter('a');


  /*
    c is null (character not found) or an object with the shape:

    {
      polygons: [...],
      triangles: {
        positions: [[x, y], ...],
        cells: [[1, 2, 3], ...]
      },
      glyph: // a opentype.js glyph
    }
  */

}

});
```

## run the demos

```
git clone git://github.com/tmpvar/gl-ttf.git
cd gl-ttf
npm install
```

for the 2d demo: `npm run demo-2d`
for the 3d demo: `npm run demo-3d`

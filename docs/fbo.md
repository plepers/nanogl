Fbo
=======
Fbo manage framebuffers creation

  - support any kind of pixel formats (RGB, RGBA, LUMINANCE etc)
  - support any kind of pixel type (UNSIGNED_BYTE, FLOAT, half float, etc)
  - optional depth and/or stencil
  - resize
  - binding helpers



##exemples

##### Fbo creation

Basic FBO

```JavaScript
var Fbo = require( 'nanogl/fbo' );

// create a default FBO :
//  - RGB
//  - UNSIGNED_BYTE
//  - no depth
//  - no stencil

var fbo = new Fbo( 128,128 );
```

A more complete example

```JavaScript

//  - RGBA
//  - FLOAT or UNSIGNED_BYTE if float not available
//  - depth and stencil enabled

var fbo = new Fbo( 128, 128, {
  depth:    true,
  stencil:  true,
  type : [gl.FLOAT, gl.UNSIGNED_BYTE ],
  format : gl.RGBA
})

// check the resolved available type. (gl.FLOAT or gl.UNSIGNED_BYTE)
var actualType = fbo.getActualType();

```

##### Resize

```JavaScript
var fbo = new Fbo( 128,128 );
// ...
fbo.resize( 64,64 );

```


##### Binding


```JavaScript

// bind the framebuffer
// and set the viewport to the Fbo dimensions
fbo.bind();

// bind the underlying color texture to a program's sampler2D uniform in unit 1
fbo.bindColor( program.uTexture(), 1 );


```

##### Clear
Clear all buffer color + stencil and depth if fbo have one

```JavaScript
// be sure fbo is bound before call clear()
fbo.bind();

fbo.clear();
```

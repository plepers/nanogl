Texture
=======
Texture class provide helpers for TEXTURE_2D textures:
  - uploading from image, canvas, video, or data
  - filtering and wrapping
It support any kind of pixel formats (RGB, RGBA, LUMINANCE etc)
and any kind of pixel type (UNSIGNED_BYTE, FLOAT etc)


##exemples

##### Texture creation

```JavaScript
var Texture = require( 'nanogl' ).Texture;

var texture = new Texture( gl );

// default pixel format is gl.RGB
// you can specify different format as folowing
var texture = new Texture( gl, gl.RGBA );

```


##### Load from image, canvas or video

```JavaScript
//You must ensure your image is loaded before send it to texture
img.onload = function(){
  texture.fromImage( img )
}

```


##### Bind texture

```JavaScript
// by default, texture is bound to the current Active texture
texture.bind();

// to bind the texture to specific unit :
texture.bind( 3 );
```

##### Allocate empty texture or load it from TypedArray

```JavaScript

// allocate empty texture
// default pixel type is gl.UNSIGNED_BYTE
texture.fromData( 128, 128 );

// you can also provide a specific pixel type
texture.fromData( 128, 128, null, gl.FLOAT );

// create texture from TypedArray (4x2 8bpp)
var texture = new Texture( gl, gl.LUMINANCE );
var data = new Uint8Array([
  0, 10, 20, 30
  20, 30, 40, 50
]);
texture.fromData( 4, 2, data );

```

##### Play with sampler options

Set MIN_FILTER and MAG_FILTER in a single call. (Texture ensure MIPMAP isn't used for MAG_FILTER)

```JavaScript

// texture must be explicitely bound before using following methods
texture.bind();

// play with filtering
// setFilter( smooth, mipmap, miplinear )

// sample LINEAR (default)
texture.setFilter( true )

// sample NEAREST
texture.setFilter( false )

// sample LINEAR_MIPMAP_NEAREST
texture.setFilter( true, true )

// sample LINEAR_MIPMAP_LINEAR
texture.setFilter( true, true, true )
```

Set WRAP_S and WRAP_T

```JavaScript

// texture must be explicitely bound before using following methods
texture.bind();

// wrap REPAET
texture.repeat()

// wrap CLAMP_TO_EDGE
texture.clamp()

// wrap MIRRORED_REPEAT
texture.mirror()

// or manual wrap
texture.wrap( gl.REPEAT )

```

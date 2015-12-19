Program
=======

##exemple

#### Create a program
``` JavaScript
var Program = require( 'nanogl' ).Program;

// create a new Program with a given gl context
var prg = new Program( gl )

// compile program with code strings
prg.compile( vertexCode, fragmentCode );
```

#### play with uniforms
Once compiled, the Program object list all used uniforms and provide setter function for each one.
> A uniform setter function support Array or TypedArray argument (`uniformNfv`) 
> or values as arguments directly (`uniformNf`)

``` JavaScript
// /!\ program must be bound BEFORE uploading some uniforms
prg.bind();

// set a mat4 uniform with a Float32Array or array
prg.uModelViewProjection( mvpMatrix );

// set a vec3 with separate arguments 
prg.uColor( 1.0, 1.0, 1.0 )

// ... or (Typed)Array
prg.uColor( [1.0, 0.0, 1.0] )

// You can also access uniform's locations to manually do those stuff
gl.uniform3f( prg.uniforms.uColor, 1.0, 1.0, 1.0 );
```

#### play with attributes

``` JavaScript
var position = prg.attributes.aPosition

// again, be sure program is bound before call related gl methods
prg.bind();
gl.vertexAttribPointer( position, 3, gl.UNSIGNED_SHORT, ... );
//...

```

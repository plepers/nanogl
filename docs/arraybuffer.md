ArrayBuffer
=======
Manage ARRAY_BUFFER type Arraybuffers.

##exemples

##### ArrayBuffer creation

```JavaScript
// create empty Arraybuffer
var buffer = new ArrayBuffer( gl );

// you can also provide initial data and optional usage hint
var data = new Float32Array([ 1, 0, 0, 0, 0, 1 ] );
var buffer = new ArrayBuffer( gl, data, gl.DYNAMIC_DRAW );
```

Set buffer data
```JavaScript
var buffer = new ArrayBuffer( gl );

// allocate buffer with TypedArray
var data = new Float32Array([ 1, 0, 0, 0, 0, 1 ] );
buffer.data( data );

// update buffer data, starting at third float
var part = new Float32Array([ 0, 0, 1 ] );
buffer.subData( part, 12 );
```

##### declare attributes

```JavaScript
// create 4 vertices ( vec3 position + vec2 uvs)

var data = new float32Array([
  -1, -1, 0, 0, 0,
   1, -1, 0, 1, 0,
  -1,  1, 0, 0, 1,
   1,  1, 0, 1, 1
]);

var buffer = new ArrayBuffer( gl, data );
buffer.attrib( 'aPosition', 3, gl.FLOAT );
buffer.attrib( 'aTexCoord', 2, gl.FLOAT );

// setup vertex attribute pointer of a given program
buffer.attribPointer( program );

```


IndexBuffer
=======
Manage ELEMENT_ARRAY_BUFFER type IndexBuffers.


##exemples

##### IndexBuffer creation

```JavaScript
// create empty IndexBuffer
// initialized as UNSIGNED_SHORT / DYNAMIC_DRAW
var buffer = new IndexBuffer( gl );

// you can also provide initial datatype, data and optional usage hint
var data = new Uint8Array([
  0, 1, 2,
  1, 3, 2
]);
var buffer = new IndexBuffer( gl, gl.UNSIGNED_BYTE, data, gl.DYNAMIC_DRAW );
```

##### Populate Buffer


```JavaScript
var buffer = new IndexBuffer( gl, gl.UNSIGNED_INT );

// allocate buffer with TypedArray
var data = new Uint32Array([
  0, 1, 2,
  1, 3, 2
]);
buffer.data( data );

// update the second triangle
var part = new Uint8Array([ 1, 2, 3 ] );
buffer.subData( part, 12 );
```


##### Drawing commands

IndexBuffer provide gl.drawElements shortcuts, with optional count/offset.

  - `drawPoints(count, offset)`
  - `drawLineStrip(count, offset)`
  - `drawLineLoop(count, offset)`
  - `drawLines(count, offset)`
  - `drawTriangleStrip(count, offset)`
  - `drawTriangleFan(count, offset)`
  - `drawTriangles(count, offset)`

`count` in elements and `offset` in bytes
If count/ offset is missing, the full buffer is drawn.
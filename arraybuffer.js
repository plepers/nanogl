import BaseBuffer from './basebuffer';
import { getComponentSize, isBufferSource } from './utils';
const GL_ARRAY_BUFFER = 0x8892;
class ArrayBuffer extends BaseBuffer {
    constructor(gl, data, usage = gl.STATIC_DRAW) {
        super();
        this.gl = gl;
        this.usage = usage || gl.STATIC_DRAW;
        this.buffer = gl.createBuffer();
        this.attribs = [];
        this.stride = 0;
        this.byteLength = 0;
        this.length = 0;
        if (data) {
            this.data(data);
        }
    }
    bind() {
        this.gl.bindBuffer(GL_ARRAY_BUFFER, this.buffer);
    }
    attrib(name, size, type, normalize = false) {
        this.attribs.push({
            name,
            type: 0 | type,
            size: 0 | size,
            normalize,
            offset: this.stride,
        });
        this.stride += getComponentSize(type) * size;
        this._computeLength();
        return this;
    }
    data(array) {
        const gl = this.gl;
        gl.bindBuffer(GL_ARRAY_BUFFER, this.buffer);
        gl.bufferData(GL_ARRAY_BUFFER, array, this.usage);
        gl.bindBuffer(GL_ARRAY_BUFFER, null);
        this.byteLength = isBufferSource(array) ? array.byteLength : array;
        this._computeLength();
    }
    subData(array, offset) {
        const gl = this.gl;
        gl.bindBuffer(GL_ARRAY_BUFFER, this.buffer);
        gl.bufferSubData(GL_ARRAY_BUFFER, offset, array);
        gl.bindBuffer(GL_ARRAY_BUFFER, null);
    }
    attribPointer(program) {
        const gl = this.gl;
        gl.bindBuffer(GL_ARRAY_BUFFER, this.buffer);
        for (var i = 0; i < this.attribs.length; i++) {
            var attrib = this.attribs[i];
            if (program[attrib.name] !== undefined) {
                var aLocation = program[attrib.name]();
                gl.enableVertexAttribArray(aLocation);
                gl.vertexAttribPointer(aLocation, attrib.size, attrib.type, attrib.normalize, this.stride, attrib.offset);
            }
        }
    }
    draw(mode, count = this.length, offset = 0) {
        this.gl.drawArrays(mode, offset, 0 | count);
    }
    dispose() {
        this.gl.deleteBuffer(this.buffer);
    }
    _computeLength() {
        if (this.stride > 0) {
            this.length = this.byteLength / this.stride;
        }
    }
}
export default ArrayBuffer;

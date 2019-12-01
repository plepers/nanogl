import BaseBuffer from './basebuffer';
import { getComponentSize, isBufferSource } from './utils';
const TGT = 0x8893;
class IndexBuffer extends BaseBuffer {
    constructor(gl, type, data, usage) {
        super();
        this.gl = gl;
        this.buffer = gl.createBuffer();
        this.usage = usage || gl.STATIC_DRAW;
        this.type = 0;
        this.typeSize = 0;
        this.byteLength = 0;
        this.setType(type || gl.UNSIGNED_SHORT);
        if (data) {
            this.data(data);
        }
    }
    bind() {
        this.gl.bindBuffer(TGT, this.buffer);
    }
    setType(type) {
        this.type = type;
        this.typeSize = getComponentSize(type);
    }
    data(array) {
        const gl = this.gl;
        gl.bindBuffer(TGT, this.buffer);
        gl.bufferData(TGT, array, this.usage);
        gl.bindBuffer(TGT, null);
        this.byteLength = isBufferSource(array) ? array.byteLength : array;
    }
    subData(array, offset) {
        const gl = this.gl;
        gl.bindBuffer(TGT, this.buffer);
        gl.bufferSubData(TGT, offset, array);
        gl.bindBuffer(TGT, null);
    }
    dispose() {
        this.gl.deleteBuffer(this.buffer);
    }
    draw(mode, count, offset = 0) {
        count = (count === undefined) ? this.byteLength / this.typeSize : count;
        this.gl.drawElements(mode, count, this.type, 0 | offset);
    }
}
export default IndexBuffer;

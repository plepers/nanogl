"use strict";
class Buffer {
    drawPoints(count, offset) {
        this.draw(0, count, offset);
    }
    drawLines(count, offset) {
        this.draw(1, count, offset);
    }
    drawLineLoop(count, offset) {
        this.draw(2, count, offset);
    }
    drawLineStrip(count, offset) {
        this.draw(3, count, offset);
    }
    drawTriangles(count, offset) {
        this.draw(4, count, offset);
    }
    drawTriangleStrip(count, offset) {
        this.draw(5, count, offset);
    }
    drawTriangleFan(count, offset) {
        this.draw(6, count, offset);
    }
}
module.exports = Buffer;

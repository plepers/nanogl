declare abstract class BaseBuffer {
    abstract bind(): void;
    abstract dispose(): void;
    abstract data(array: BufferSource | GLsizeiptr): void;
    abstract subData(array: BufferSource, offset: number): void;
    abstract draw(mode: GLenum, count?: number, offset?: number): void;
    drawPoints(count?: number, offset?: number): void;
    drawLines(count?: number, offset?: number): void;
    drawLineLoop(count?: number, offset?: number): void;
    drawLineStrip(count?: number, offset?: number): void;
    drawTriangles(count?: number, offset?: number): void;
    drawTriangleStrip(count?: number, offset?: number): void;
    drawTriangleFan(count?: number, offset?: number): void;
}
export default BaseBuffer;

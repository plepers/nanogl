export function isWebgl2(context) {
    return context.fenceSync !== undefined;
}
export function isBufferSource(val) {
    return val.byteLength !== undefined;
}
export function getTextureFiltering(smooth, mipmap, miplinear) {
    return 0x2600 | +smooth | (+mipmap << 8) | (+(mipmap && miplinear) << 1);
}
export function getComponentSize(type) {
    switch (type) {
        case 0x1400:
        case 0x1401:
            return 1;
        case 0x1402:
        case 0x1403:
            return 2;
        case 0x1404:
        case 0x1405:
        case 0x1406:
            return 4;
        default:
            return 0;
    }
}

export function isWebgl2(context) {
    return context.fenceSync !== undefined;
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isWebgl2(context) {
    return context.fenceSync !== undefined;
}
exports.isWebgl2 = isWebgl2;

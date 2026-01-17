const { TextEncoder, TextDecoder } = require("node:util");
const { ReadableStream, WritableStream, TransformStream } = require("node:stream/web");

if (!globalThis.TextEncoder) {
    globalThis.TextEncoder = TextEncoder;
}

if (!globalThis.TextDecoder) {
    globalThis.TextDecoder = TextDecoder;
}

if (!globalThis.ReadableStream) {
    globalThis.ReadableStream = ReadableStream;
}

if (!globalThis.WritableStream) {
    globalThis.WritableStream = WritableStream;
}

if (!globalThis.TransformStream) {
    globalThis.TransformStream = TransformStream;
}

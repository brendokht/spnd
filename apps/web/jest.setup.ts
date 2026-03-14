import "@testing-library/jest-dom";
import "cross-fetch/polyfill";
import { TextDecoder, TextEncoder } from "util";

/*
 * Ensure required functions and whatnot are mocked for the Server Actions
 * Must do this since we're using `jsdom` environment, and these are node specific
 */
if (typeof window !== "undefined") {
  Object.defineProperty(window, "TextEncoder", {
    writable: true,
    value: TextEncoder,
  });
  Object.defineProperty(window, "TextDecoder", {
    writable: true,
    value: TextDecoder,
  });
}

if (typeof global.Request === "undefined") {
  global.Request = class Request {} as unknown as typeof Request;
}

if (typeof global.Response === "undefined") {
  global.Response = class Response {} as unknown as typeof Response;
}

if (typeof global.Headers === "undefined") {
  global.Headers = class Headers {} as unknown as typeof Headers;
}

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
